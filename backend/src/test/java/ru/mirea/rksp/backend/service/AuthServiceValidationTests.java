package ru.mirea.rksp.backend.service;

import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import ru.mirea.rksp.backend.dto.auth.LoginRequestDto;
import ru.mirea.rksp.backend.dto.auth.RegisterRequestDto;
import ru.mirea.rksp.backend.entity.UserEntity;
import ru.mirea.rksp.backend.repository.UserRepository;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceValidationTests {

    private UserRepository userRepository;
    private PasswordService passwordService;
    private SessionCookieService sessionCookieService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordService = mock(PasswordService.class);
        sessionCookieService = mock(SessionCookieService.class);

        authService = new AuthService(userRepository, passwordService, sessionCookieService);
    }

    @Test
    void loginRejectsBlankCredentials() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.login(new LoginRequestDto(" ", ""), mock(HttpServletResponse.class))
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    void registerRejectsShortPassword() {
        RegisterRequestDto request = new RegisterRequestDto(
                "test@company.ru",
                "123",
                "tester",
                "Test User"
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.register(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void registerRejectsInvalidEmail() {
        RegisterRequestDto request = new RegisterRequestDto(
                "not-an-email",
                "password123",
                "tester",
                "Test User"
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.register(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void registerRejectsInvalidUsername() {
        RegisterRequestDto request = new RegisterRequestDto(
                "test@company.ru",
                "password123",
                "тестер",
                "Test User"
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.register(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmail("test@company.ru")).thenReturn(true);

        RegisterRequestDto request = new RegisterRequestDto(
                "TEST@company.ru",
                "password123",
                "tester",
                "Test User"
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.register(request)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void registerNormalizesEmailAndAssignsUserRole() {
        when(userRepository.existsByEmail("test@company.ru")).thenReturn(false);
        when(userRepository.existsByUsername("tester")).thenReturn(false);
        when(passwordService.hashPassword("password123")).thenReturn("hashed-value");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity user = invocation.getArgument(0);
            user.setId("user-1");
            user.setCreatedAt(Instant.now());
            return user;
        });

        RegisterRequestDto request = new RegisterRequestDto(
                "TEST@company.ru",
                "password123",
                "tester",
                "Test User"
        );

        var response = authService.register(request);

        assertEquals("test@company.ru", response.user().email());
        assertEquals("user", response.user().role());
        assertEquals("tester", response.user().username());
    }

    @Test
    void loginRejectsWrongPassword() {
        UserEntity user = new UserEntity();
        user.setId("user-1");
        user.setEmail("test@company.ru");
        user.setUsername("tester");
        user.setFullName("Test User");
        user.setRole("user");
        user.setPasswordHash("hash");
        user.setCreatedAt(Instant.now());

        when(userRepository.findByEmail("test@company.ru")).thenReturn(Optional.of(user));
        when(passwordService.matches("wrong-password", "hash")).thenReturn(false);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.login(
                        new LoginRequestDto("test@company.ru", "wrong-password"),
                        mock(HttpServletResponse.class)
                )
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }
}
