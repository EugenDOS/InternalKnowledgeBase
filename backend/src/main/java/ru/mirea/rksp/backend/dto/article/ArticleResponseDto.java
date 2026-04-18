package ru.mirea.rksp.backend.dto.article;

import java.util.List;

public record ArticleResponseDto(
        String id,
        String title,
        String content,
        String excerpt,
        String categoryId,
        String authorId,
        List<String> tags,
        String createdAt,
        String updatedAt
) {
}
