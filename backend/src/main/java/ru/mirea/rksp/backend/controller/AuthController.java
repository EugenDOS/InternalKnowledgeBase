package ru.mirea.rksp.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import ru.mirea.rksp.backend.dto.auth.AuthResponseDto;
import ru.mirea.rksp.backend.dto.auth.LoginRequestDto;
import ru.mirea.rksp.backend.dto.auth.RegisterRequestDto;
import ru.mirea.rksp.backend.dto.common.SuccessResponseDto;
import ru.mirea.rksp.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponseDto login(@RequestBody LoginRequestDto request, HttpServletResponse response) {
        return authService.login(request, response);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponseDto register(@RequestBody RegisterRequestDto request) {
        return authService.register(request);
    }

    @GetMapping("/me")
    public AuthResponseDto me(HttpServletRequest request) {
        return authService.getCurrentUserResponse(request);
    }

    @PostMapping("/logout")
    public SuccessResponseDto logout(HttpServletResponse response) {
        return authService.logout(response);
    }
}
