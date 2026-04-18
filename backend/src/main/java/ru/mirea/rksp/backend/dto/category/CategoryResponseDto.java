package ru.mirea.rksp.backend.dto.category;

public record CategoryResponseDto(
        String id,
        String name,
        String slug,
        String description,
        Integer articleCount
) {
}
