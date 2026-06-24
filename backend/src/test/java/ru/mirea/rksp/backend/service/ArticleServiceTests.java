package ru.mirea.rksp.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import ru.mirea.rksp.backend.dto.article.CreateArticleRequestDto;
import ru.mirea.rksp.backend.dto.article.UpdateArticleRequestDto;
import ru.mirea.rksp.backend.entity.ArticleEntity;
import ru.mirea.rksp.backend.entity.CategoryEntity;
import ru.mirea.rksp.backend.entity.UserEntity;
import ru.mirea.rksp.backend.repository.ArticleRepository;
import ru.mirea.rksp.backend.repository.CategoryRepository;
import ru.mirea.rksp.backend.repository.UserRepository;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ArticleServiceTests {

    private ArticleRepository articleRepository;
    private CategoryRepository categoryRepository;
    private UserRepository userRepository;
    private ArticleService articleService;

    @BeforeEach
    void setUp() {
        articleRepository = mock(ArticleRepository.class);
        categoryRepository = mock(CategoryRepository.class);
        userRepository = mock(UserRepository.class);
        articleService = new ArticleService(articleRepository, categoryRepository, userRepository);
    }

    @Test
    void listsAndFindsArticles() {
        ArticleEntity article = article("article-1", user("user-1", "user"), category("category-1"));
        when(articleRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(article));
        when(articleRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc("query"))
                .thenReturn(List.of(article));
        when(articleRepository.findById("article-1")).thenReturn(Optional.of(article));

        assertEquals(1, articleService.getArticles(null).size());
        assertEquals(1, articleService.getArticles("  ").size());
        assertEquals(1, articleService.getArticles(" query ").size());
        assertEquals("article-1", articleService.getArticleById("article-1").id());
        verify(articleRepository).findByTitleContainingIgnoreCaseOrderByCreatedAtDesc("query");
    }

    @Test
    void missingArticleReturnsNotFound() {
        when(articleRepository.findById("missing")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> articleService.getArticleById("missing")
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void ownerCreatesArticleWithNormalizedOptionalFields() {
        UserEntity owner = user("user-1", "user");
        CategoryEntity category = category("category-1");
        when(categoryRepository.findById("category-1")).thenReturn(Optional.of(category));
        when(articleRepository.save(any(ArticleEntity.class))).thenAnswer(invocation -> {
            ArticleEntity saved = invocation.getArgument(0);
            saved.setId("article-1");
            return saved;
        });

        var result = articleService.createArticle(
                new CreateArticleRequestDto(
                        " Title ",
                        null,
                        " Excerpt ",
                        " category-1 ",
                        " user-1 ",
                        Arrays.asList(" tag ", null, "", "tag", "second")
                ),
                owner
        );

        assertEquals("Title", result.title());
        assertEquals("", result.content());
        assertEquals("Excerpt", result.excerpt());
        assertEquals(List.of("tag", "second"), result.tags());
        assertEquals("user-1", result.authorId());
    }

    @Test
    void adminCreatesArticleForRequestedAuthor() {
        UserEntity admin = user("admin-1", "admin");
        UserEntity author = user("user-1", "user");
        CategoryEntity category = category("category-1");
        when(categoryRepository.findById("category-1")).thenReturn(Optional.of(category));
        when(userRepository.findById("user-1")).thenReturn(Optional.of(author));
        when(articleRepository.save(any(ArticleEntity.class))).thenAnswer(invocation -> {
            ArticleEntity saved = invocation.getArgument(0);
            saved.setId("article-1");
            return saved;
        });

        var result = articleService.createArticle(
                new CreateArticleRequestDto("Title", "Content", "Excerpt", "category-1", "user-1", null),
                admin
        );

        assertEquals("user-1", result.authorId());
        assertTrue(result.tags().isEmpty());
    }

    @Test
    void createValidatesRequiredFieldsAndReferences() {
        UserEntity owner = user("user-1", "user");
        CreateArticleRequestDto blankTitle = new CreateArticleRequestDto(
                " ", "Content", "Excerpt", "category-1", "user-1", List.of()
        );
        assertEquals(
                HttpStatus.BAD_REQUEST,
                assertThrows(ResponseStatusException.class, () -> articleService.createArticle(blankTitle, owner))
                        .getStatusCode()
        );

        CreateArticleRequestDto missingCategory = new CreateArticleRequestDto(
                "Title", "Content", "Excerpt", "missing", "user-1", List.of()
        );
        when(categoryRepository.findById("missing")).thenReturn(Optional.empty());
        assertEquals(
                HttpStatus.NOT_FOUND,
                assertThrows(ResponseStatusException.class, () -> articleService.createArticle(missingCategory, owner))
                        .getStatusCode()
        );

        UserEntity admin = user("admin-1", "admin");
        CreateArticleRequestDto missingAuthor = new CreateArticleRequestDto(
                "Title", "Content", "Excerpt", "category-1", "missing", List.of()
        );
        when(categoryRepository.findById("category-1")).thenReturn(Optional.of(category("category-1")));
        when(userRepository.findById("missing")).thenReturn(Optional.empty());
        assertEquals(
                HttpStatus.NOT_FOUND,
                assertThrows(ResponseStatusException.class, () -> articleService.createArticle(missingAuthor, admin))
                        .getStatusCode()
        );
    }

    @Test
    void ownerUpdatesEveryEditableField() {
        UserEntity owner = user("user-1", "user");
        ArticleEntity article = article("article-1", owner, category("category-1"));
        CategoryEntity replacement = category("category-2");
        when(articleRepository.findById("article-1")).thenReturn(Optional.of(article));
        when(categoryRepository.findById("category-2")).thenReturn(Optional.of(replacement));
        when(articleRepository.save(article)).thenReturn(article);

        var result = articleService.updateArticle(
                "article-1",
                new UpdateArticleRequestDto(
                        " New title ",
                        " New content ",
                        " New excerpt ",
                        " category-2 ",
                        " user-1 ",
                        List.of("one", " one ", "two")
                ),
                owner
        );

        assertEquals("New title", result.title());
        assertEquals("New content", result.content());
        assertEquals("New excerpt", result.excerpt());
        assertEquals("category-2", result.categoryId());
        assertEquals(List.of("one", "two"), result.tags());
    }

    @Test
    void emptyUpdateAndDeleteOwnArticleSucceed() {
        UserEntity owner = user("user-1", "user");
        ArticleEntity article = article("article-1", owner, category("category-1"));
        when(articleRepository.findById("article-1")).thenReturn(Optional.of(article));
        when(articleRepository.save(article)).thenReturn(article);

        assertEquals(
                "article-1",
                articleService.updateArticle(
                        "article-1",
                        new UpdateArticleRequestDto(null, null, null, null, null, null),
                        owner
                ).id()
        );

        articleService.deleteArticle("article-1", owner);
        verify(articleRepository).delete(article);
    }

    @Test
    void updateRejectsBlankValuesAndMissingCategory() {
        UserEntity owner = user("user-1", "user");
        ArticleEntity article = article("article-1", owner, category("category-1"));
        when(articleRepository.findById("article-1")).thenReturn(Optional.of(article));

        ResponseStatusException blankTitle = assertThrows(
                ResponseStatusException.class,
                () -> articleService.updateArticle(
                        "article-1",
                        new UpdateArticleRequestDto(" ", null, null, null, null, null),
                        owner
                )
        );
        assertEquals(HttpStatus.BAD_REQUEST, blankTitle.getStatusCode());

        when(categoryRepository.findById("missing")).thenReturn(Optional.empty());
        ResponseStatusException missingCategory = assertThrows(
                ResponseStatusException.class,
                () -> articleService.updateArticle(
                        "article-1",
                        new UpdateArticleRequestDto(null, null, null, "missing", null, null),
                        owner
                )
        );
        assertEquals(HttpStatus.NOT_FOUND, missingCategory.getStatusCode());
    }

    private UserEntity user(String id, String role) {
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setUsername(id);
        user.setEmail(id + "@company.ru");
        user.setRole(role);
        user.setFullName("User " + id);
        user.setPasswordHash("salt:hash");
        user.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        return user;
    }

    private CategoryEntity category(String id) {
        CategoryEntity category = new CategoryEntity();
        category.setId(id);
        category.setName("Category " + id);
        category.setSlug(id);
        category.setDescription("Description");
        category.setArticleCount(1);
        return category;
    }

    private ArticleEntity article(String id, UserEntity author, CategoryEntity category) {
        ArticleEntity article = new ArticleEntity();
        article.setId(id);
        article.setTitle("Title");
        article.setContent("Content");
        article.setExcerpt("Excerpt");
        article.setCategory(category);
        article.setAuthor(author);
        article.setTags(new String[]{"tag"});
        article.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        article.setUpdatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        return article;
    }
}
