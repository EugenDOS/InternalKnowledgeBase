package ru.mirea.rksp.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.mirea.rksp.backend.dto.auth.AuthResponseDto;
import ru.mirea.rksp.backend.dto.auth.LoginRequestDto;
import ru.mirea.rksp.backend.dto.auth.RegisterRequestDto;
import ru.mirea.rksp.backend.dto.common.SuccessResponseDto;
import ru.mirea.rksp.backend.entity.UserEntity;
import ru.mirea.rksp.backend.mapper.ApiMapper;
import ru.mirea.rksp.backend.repository.UserRepository;

import java.time.Instant;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordService passwordService;
    private final SessionCookieService sessionCookieService;

    public AuthService(
            UserRepository userRepository,
            PasswordService passwordService,
            SessionCookieService sessionCookieService
    ) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.sessionCookieService = sessionCookieService;
    }

    @Transactional
    public AuthResponseDto login(LoginRequestDto request, HttpServletResponse response) {
        String email = normalizeEmail(requireText(request.email(), "Email и пароль обязательны"));
        String password = requireText(request.password(), "Email и пароль обязательны");

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Неверный email или пароль"));

        if (!passwordService.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Неверный email или пароль");
        }

        if (passwordService.isLegacyHash(user.getPasswordHash())) {
            user.setPasswordHash(passwordService.hashPassword(password));
            userRepository.save(user);
        }

        sessionCookieService.writeAuthCookie(response, user.getId());
        return new AuthResponseDto(ApiMapper.toUserDto(user));
    }

    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        String email = normalizeEmail(requireText(request.email(), "Все поля обязательны"));
        String password = requireText(request.password(), "Все поля обязательны");
        String username = requireText(request.username(), "Все поля обязательны");
        String fullName = requireText(request.fullName(), "Все поля обязательны");

        if (password.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Пароль должен содержать не менее 6 символов");
        }

        if (username.length() < 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Имя пользователя должно содержать не менее 3 символов");
        }

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Пользователь с таким email уже существует");
        }

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Имя пользователя уже занято");
        }

        UserEntity user = new UserEntity();
        user.setEmail(email);
        user.setUsername(username);
        user.setFullName(fullName);
        user.setRole("user");
        user.setPasswordHash(passwordService.hashPassword(password));
        user.setCreatedAt(Instant.now());

        UserEntity savedUser = userRepository.save(user);
        return new AuthResponseDto(ApiMapper.toUserDto(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponseDto getCurrentUserResponse(HttpServletRequest request) {
        return new AuthResponseDto(ApiMapper.toUserDto(requireCurrentUser(request)));
    }

    public SuccessResponseDto logout(HttpServletResponse response) {
        sessionCookieService.clearAuthCookie(response);
        return new SuccessResponseDto(true);
    }

    @Transactional(readOnly = true)
    public UserEntity requireCurrentUser(HttpServletRequest request) {
        String userId = sessionCookieService.readUserId(request)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Требуется авторизация"));

        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Пользователь не авторизован"));
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }

        return value.trim();
    }

    private String normalizeEmail(String email) {
        return email.toLowerCase(Locale.ROOT);
    }
}
