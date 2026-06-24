package ru.mirea.rksp.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Optional;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SessionCookieServiceFuzzTests {

    private static final String COOKIE_NAME = "knowledge-base-session";
    private static final String ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-";

    private SessionCookieService sessionCookieService;
    private final Random random = new Random(73);

    @BeforeEach
    void setUp() {
        sessionCookieService = new SessionCookieService(
                new ObjectMapper(),
                "test-session-secret-at-least-32-characters",
                COOKIE_NAME,
                3_600,
                false
        );
    }

    @Test
    void validCookieRoundTripRestoresUserId() {
        MockHttpServletResponse response = new MockHttpServletResponse();
        sessionCookieService.writeAuthCookie(response, "user-123");

        String token = extractCookieValue(response.getHeader("Set-Cookie"));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie(COOKIE_NAME, token));

        assertEquals(Optional.of("user-123"), sessionCookieService.readUserId(request));
    }

    @Test
    void malformedCookiesAreIgnoredWithoutCrashing() {
        for (int index = 0; index < 50; index++) {
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.setCookies(new Cookie(COOKIE_NAME, randomString(1 + random.nextInt(120))));

            assertTrue(sessionCookieService.readUserId(request).isEmpty());
        }
    }

    @Test
    void tamperedCookieSignatureIsRejected() {
        MockHttpServletResponse response = new MockHttpServletResponse();
        sessionCookieService.writeAuthCookie(response, "user-123");

        String token = extractCookieValue(response.getHeader("Set-Cookie"));
        String tamperedToken = token.substring(0, token.length() - 1) + "x";

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie(COOKIE_NAME, tamperedToken));

        assertTrue(sessionCookieService.readUserId(request).isEmpty());
    }

    @Test
    void missingAndUnrelatedCookiesAreIgnored() {
        MockHttpServletRequest noCookies = new MockHttpServletRequest();
        assertTrue(sessionCookieService.readUserId(noCookies).isEmpty());

        MockHttpServletRequest unrelated = new MockHttpServletRequest();
        unrelated.setCookies(new Cookie("other", "value"));
        assertTrue(sessionCookieService.readUserId(unrelated).isEmpty());
    }

    @Test
    void expiredCookieIsRejected() {
        SessionCookieService expiredService = new SessionCookieService(
                new ObjectMapper(),
                "test-session-secret-at-least-32-characters",
                COOKIE_NAME,
                -1,
                false
        );
        MockHttpServletResponse response = new MockHttpServletResponse();
        expiredService.writeAuthCookie(response, "user-123");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie(COOKIE_NAME, extractCookieValue(response.getHeader("Set-Cookie"))));

        assertTrue(expiredService.readUserId(request).isEmpty());
    }

    @Test
    void clearCookiePreservesSecurityAttributes() {
        SessionCookieService secureService = new SessionCookieService(
                new ObjectMapper(),
                "test-session-secret-at-least-32-characters",
                COOKIE_NAME,
                3_600,
                true
        );
        MockHttpServletResponse response = new MockHttpServletResponse();

        secureService.clearAuthCookie(response);

        String header = response.getHeader("Set-Cookie");
        assertTrue(header.contains("Max-Age=0"));
        assertTrue(header.contains("HttpOnly"));
        assertTrue(header.contains("Secure"));
        assertFalse(header.contains("user-123"));
    }

    @Test
    void weakOrPlaceholderSecretIsRejected() {
        assertThrows(
                IllegalArgumentException.class,
                () -> new SessionCookieService(new ObjectMapper(), "short", COOKIE_NAME, 3_600, false)
        );
        assertThrows(
                IllegalArgumentException.class,
                () -> new SessionCookieService(
                        new ObjectMapper(),
                        "replace-with-at-least-32-random-characters",
                        COOKIE_NAME,
                        3_600,
                        false
                )
        );
    }

    private String extractCookieValue(String setCookieHeader) {
        return setCookieHeader.split(";", 2)[0].split("=", 2)[1];
    }

    private String randomString(int length) {
        StringBuilder builder = new StringBuilder(length);

        for (int index = 0; index < length; index++) {
            int randomIndex = random.nextInt(ALPHABET.length());
            builder.append(ALPHABET.charAt(randomIndex));
        }

        return builder.toString();
    }
}
