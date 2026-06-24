package ru.mirea.rksp.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Base64;
import java.util.Optional;

@Service
public class SessionCookieService {

    private static final int MINIMUM_SECRET_LENGTH = 32;

    private final ObjectMapper objectMapper;
    private final String secret;
    private final String cookieName;
    private final long cookieMaxAge;
    private final boolean secureCookie;

    public SessionCookieService(
            ObjectMapper objectMapper,
            @Value("${app.auth.secret}") String secret,
            @Value("${app.auth.cookie-name}") String cookieName,
            @Value("${app.auth.cookie-max-age}") long cookieMaxAge,
            @Value("${app.auth.secure-cookie}") boolean secureCookie
    ) {
        if (secret == null
                || secret.length() < MINIMUM_SECRET_LENGTH
                || secret.startsWith("replace-")
                || secret.contains("change-me")) {
            throw new IllegalArgumentException(
                    "APP_AUTH_SECRET должен быть случайным значением длиной не менее 32 символов"
            );
        }

        this.objectMapper = objectMapper;
        this.secret = secret;
        this.cookieName = cookieName;
        this.cookieMaxAge = cookieMaxAge;
        this.secureCookie = secureCookie;
    }

    public void writeAuthCookie(HttpServletResponse response, String userId) {
        String token = createSessionToken(userId);

        ResponseCookie cookie = ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofSeconds(cookieMaxAge))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearAuthCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public Optional<String> readUserId(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }

        for (Cookie cookie : cookies) {
            if (!cookieName.equals(cookie.getName())) {
                continue;
            }

            return readSessionToken(cookie.getValue()).map(SessionPayload::userId);
        }

        return Optional.empty();
    }

    private String createSessionToken(String userId) {
        try {
            SessionPayload payload = new SessionPayload(userId, System.currentTimeMillis() + cookieMaxAge * 1000);
            String encodedPayload = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(objectMapper.writeValueAsBytes(payload));

            return encodedPayload + "." + sign(encodedPayload);
        } catch (Exception exception) {
            throw new IllegalStateException("Не удалось создать cookie-сессию", exception);
        }
    }

    private Optional<SessionPayload> readSessionToken(String token) {
        try {
            if (token == null || token.isBlank()) {
                return Optional.empty();
            }

            String[] parts = token.split("\\.");
            if (parts.length != 2) {
                return Optional.empty();
            }

            String encodedPayload = parts[0];
            String signature = parts[1];
            String expectedSignature = sign(encodedPayload);

            if (!MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.UTF_8),
                    signature.getBytes(StandardCharsets.UTF_8)
            )) {
                return Optional.empty();
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(encodedPayload);
            SessionPayload payload = objectMapper.readValue(payloadBytes, SessionPayload.class);

            if (payload.expiresAt() <= System.currentTimeMillis()) {
                return Optional.empty();
            }

            return Optional.of(payload);
        } catch (Exception exception) {
            return Optional.empty();
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(key);

            byte[] signature = mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signature);
        } catch (Exception exception) {
            throw new IllegalStateException("Не удалось подписать cookie-сессию", exception);
        }
    }

    private record SessionPayload(String userId, long expiresAt) {
    }
}
