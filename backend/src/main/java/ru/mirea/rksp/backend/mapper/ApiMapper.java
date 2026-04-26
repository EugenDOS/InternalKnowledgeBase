package ru.mirea.rksp.backend.mapper;

import ru.mirea.rksp.backend.dto.article.ArticleResponseDto;
import ru.mirea.rksp.backend.dto.category.CategoryResponseDto;
import ru.mirea.rksp.backend.dto.user.UserResponseDto;
import ru.mirea.rksp.backend.entity.ArticleEntity;
import ru.mirea.rksp.backend.entity.CategoryEntity;
import ru.mirea.rksp.backend.entity.UserEntity;

import java.util.Arrays;
import java.util.List;

public final class ApiMapper {

    private ApiMapper() {
    }

    public static UserResponseDto toUserDto(UserEntity user) {
        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getFullName(),
                user.getCreatedAt().toString()
        );
    }

    public static CategoryResponseDto toCategoryDto(CategoryEntity category) {
        return new CategoryResponseDto(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getArticleCount()
        );
    }

    public static ArticleResponseDto toArticleDto(ArticleEntity article) {
        List<String> tags = article.getTags() == null
                ? List.of()
                : Arrays.asList(article.getTags());

        return new ArticleResponseDto(
                article.getId(),
                article.getTitle(),
                article.getContent(),
                article.getExcerpt(),
                article.getCategory().getId(),
                article.getAuthor().getId(),
                article.getAuthor().getFullName(),
                tags,
                article.getCreatedAt().toString(),
                article.getUpdatedAt().toString()
        );
    }
}
