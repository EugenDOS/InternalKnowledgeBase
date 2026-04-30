package ru.mirea.rksp.backend.mapper;

import org.junit.jupiter.api.Test;
import ru.mirea.rksp.backend.entity.ArticleEntity;
import ru.mirea.rksp.backend.entity.CategoryEntity;
import ru.mirea.rksp.backend.entity.UserEntity;

import java.lang.reflect.Constructor;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiMapperTests {

    @Test
    void mapsUserCategoryAndArticleToDtos() {
        UserEntity user = createUser();
        CategoryEntity category = createCategory();
        ArticleEntity article = createArticle(user, category);

        assertEquals("user-1", ApiMapper.toUserDto(user).id());
        assertEquals("guides", ApiMapper.toCategoryDto(category).slug());

        var articleDto = ApiMapper.toArticleDto(article);

        assertEquals("article-1", articleDto.id());
        assertEquals("category-1", articleDto.categoryId());
        assertEquals("user-1", articleDto.authorId());
        assertEquals("User", articleDto.authorFullName());
        assertEquals(List.of("tag"), articleDto.tags());
    }

    @Test
    void mapsNullArticleTagsToEmptyList() {
        ArticleEntity article = createArticle(createUser(), createCategory());
        article.setTags(null);

        assertTrue(ApiMapper.toArticleDto(article).tags().isEmpty());
    }

    @Test
    void privateConstructorIsCoveredForUtilityClass() throws Exception {
        Constructor<ApiMapper> constructor = ApiMapper.class.getDeclaredConstructor();
        constructor.setAccessible(true);

        constructor.newInstance();
    }

    private UserEntity createUser() {
        UserEntity user = new UserEntity();
        user.setId("user-1");
        user.setUsername("user");
        user.setEmail("user@company.ru");
        user.setRole("user");
        user.setFullName("User");
        user.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        return user;
    }

    private CategoryEntity createCategory() {
        CategoryEntity category = new CategoryEntity();
        category.setId("category-1");
        category.setName("Категория");
        category.setSlug("guides");
        category.setDescription("Описание");
        category.setArticleCount(1);
        return category;
    }

    private ArticleEntity createArticle(UserEntity user, CategoryEntity category) {
        ArticleEntity article = new ArticleEntity();
        article.setId("article-1");
        article.setTitle("Статья");
        article.setContent("Текст");
        article.setExcerpt("Кратко");
        article.setCategory(category);
        article.setAuthor(user);
        article.setTags(new String[]{"tag"});
        article.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        article.setUpdatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        return article;
    }
}
