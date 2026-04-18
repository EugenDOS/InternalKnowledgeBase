package ru.mirea.rksp.backend.dto.auth;

public record RegisterRequestDto(
        String email,
        String password,
        String username,
        String fullName
) {
}
