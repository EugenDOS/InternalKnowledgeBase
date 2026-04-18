package ru.mirea.rksp.backend.dto.category;

import ru.mirea.rksp.backend.dto.article.ArticleResponseDto;

import java.util.List;

public record CategoryDetailsResponseDto(
        CategoryResponseDto category,
        List<ArticleResponseDto> articles
) {
}
