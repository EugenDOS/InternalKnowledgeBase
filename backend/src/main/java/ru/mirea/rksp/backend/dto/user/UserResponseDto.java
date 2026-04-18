package ru.mirea.rksp.backend.dto.user;

public record UserResponseDto(
        String id,
        String username,
        String email,
        String role,
        String fullName,
        String createdAt
) {
}
