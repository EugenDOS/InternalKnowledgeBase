package ru.mirea.rksp.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import ru.mirea.rksp.backend.entity.ArticleEntity;
import ru.mirea.rksp.backend.entity.CategoryEntity;
import ru.mirea.rksp.backend.entity.UserEntity;
import ru.mirea.rksp.backend.repository.ArticleRepository;
import ru.mirea.rksp.backend.repository.CategoryRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CategoryServiceTests {

    private CategoryRepository categoryRepository;
    private ArticleRepository articleRepository;
    private CategoryService categoryService;

    @BeforeEach
    void setUp() {
        categoryRepository = mock(CategoryRepository.class);
        articleRepository = mock(ArticleRepository.class);
        categoryService = new CategoryService(categoryRepository, articleRepository);
    }

    @Test
    void returnsAllCategoriesOrderedByName() {
        CategoryEntity category = createCategory("category-1", "guides");
        when(categoryRepository.findAllByOrderByNameAsc()).thenReturn(List.of(category));

        var response = categoryService.getAllCategories();

        assertEquals(1, response.size());
        assertEquals("category-1", response.getFirst().id());
        assertEquals("guides", response.getFirst().slug());
    }

    @Test
    void returnsCategoryDetailsWithArticles() {
        CategoryEntity category = createCategory("category-1", "guides");
        ArticleEntity article = createArticle("article-1", category);

        when(categoryRepository.findBySlug("guides")).thenReturn(Optional.of(category));
        when(articleRepository.findByCategory_IdOrderByCreatedAtDesc("category-1")).thenReturn(List.of(article));

        var response = categoryService.getCategoryDetails("guides");

        assertEquals("category-1", response.category().id());
        assertEquals(List.of("article-1"), response.articles().stream().map(item -> item.id()).toList());
    }

    @Test
    void throwsNotFoundForMissingCategory() {
        when(categoryRepository.findBySlug("missing")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> categoryService.getCategoryDetails("missing")
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    private CategoryEntity createCategory(String id, String slug) {
        CategoryEntity category = new CategoryEntity();
        category.setId(id);
        category.setName("Категория");
        category.setSlug(slug);
        category.setDescription("Описание");
        category.setArticleCount(1);
        return category;
    }

    private ArticleEntity createArticle(String id, CategoryEntity category) {
        UserEntity author = new UserEntity();
        author.setId("user-1");
        author.setUsername("user");
        author.setEmail("user@company.ru");
        author.setRole("user");
        author.setFullName("User");
        author.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));

        ArticleEntity article = new ArticleEntity();
        article.setId(id);
        article.setTitle("Статья");
        article.setContent("Текст");
        article.setExcerpt("Кратко");
        article.setCategory(category);
        article.setAuthor(author);
        article.setTags(new String[]{"tag"});
        article.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        article.setUpdatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        return article;
    }
}
