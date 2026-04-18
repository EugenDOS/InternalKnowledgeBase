package ru.mirea.rksp.backend.dto.auth;

import ru.mirea.rksp.backend.dto.user.UserResponseDto;

public record AuthResponseDto(UserResponseDto user) {
}
