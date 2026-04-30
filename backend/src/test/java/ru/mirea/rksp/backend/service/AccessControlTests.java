package ru.mirea.rksp.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import ru.mirea.rksp.backend.dto.article.UpdateArticleRequestDto;
import ru.mirea.rksp.backend.entity.ArticleEntity;
import ru.mirea.rksp.backend.entity.CategoryEntity;
import ru.mirea.rksp.backend.entity.UserEntity;
import ru.mirea.rksp.backend.repository.ArticleRepository;
import ru.mirea.rksp.backend.repository.CategoryRepository;
import ru.mirea.rksp.backend.repository.UserRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AccessControlTests {

    private ArticleRepository articleRepository;
    private CategoryRepository categoryRepository;
    private UserRepository userRepository;
    private ArticleService articleService;
    private UserService userService;

    @BeforeEach
    void setUp() {
        articleRepository = mock(ArticleRepository.class);
        categoryRepository = mock(CategoryRepository.class);
        userRepository = mock(UserRepository.class);

        articleService = new ArticleService(articleRepository, categoryRepository, userRepository);
        userService = new UserService(userRepository);
    }

    @Test
    void regularUserCannotCreateArticleForAnotherAuthor() {
        UserEntity currentUser = createUser("user-1", "user");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> articleService.createArticle(
                        new ru.mirea.rksp.backend.dto.article.CreateArticleRequestDto(
                                "Новая статья",
                                "Текст",
                                "Кратко",
                                "category-1",
                                "user-2",
                                List.of("test")
                        ),
                        currentUser
                )
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(categoryRepository, never()).findById(any());
    }

    @Test
    void regularUserCannotChangeArticleAuthor() {
        UserEntity currentUser = createUser("user-1", "user");
        ArticleEntity article = createArticle("article-1", currentUser);

        when(articleRepository.findById("article-1")).thenReturn(Optional.of(article));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> articleService.updateArticle(
                        "article-1",
                        new UpdateArticleRequestDto(null, null, null, null, "user-2", null),
                        currentUser
                )
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void regularUserCannotDeleteForeignArticle() {
        UserEntity articleAuthor = createUser("user-1", "user");
        UserEntity anotherUser = createUser("user-2", "user");
        ArticleEntity article = createArticle("article-1", articleAuthor);

        when(articleRepository.findById("article-1")).thenReturn(Optional.of(article));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> articleService.deleteArticle("article-1", anotherUser)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void nonAdminCannotRequestUserList() {
        UserEntity currentUser = createUser("user-1", "user");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> userService.getAllUsers(currentUser)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }

    @Test
    void nonAdminCannotRequestUserById() {
        UserEntity currentUser = createUser("user-1", "user");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> userService.getUserById("user-2", currentUser)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(userRepository, never()).findById(any());
    }

    @Test
    void adminCanRequestUserById() {
        UserEntity admin = createUser("admin-1", "admin");
        UserEntity requestedUser = createUser("user-2", "user");

        when(userRepository.findById("user-2")).thenReturn(Optional.of(requestedUser));

        var response = userService.getUserById("user-2", admin);

        assertEquals("user-2", response.id());
    }

    @Test
    void adminCanRequestUserList() {
        UserEntity admin = createUser("admin-1", "admin");
        UserEntity firstUser = createUser("user-1", "user");
        UserEntity secondUser = createUser("user-2", "user");

        when(userRepository.findAllByOrderByCreatedAtAsc()).thenReturn(List.of(firstUser, secondUser));

        var response = userService.getAllUsers(admin);

        assertEquals(List.of("user-1", "user-2"), response.stream().map(item -> item.id()).toList());
    }

    @Test
    void adminUserByIdReturnsNotFoundForMissingUser() {
        UserEntity admin = createUser("admin-1", "admin");
        when(userRepository.findById("missing")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> userService.getUserById("missing", admin)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void adminCanReassignArticleAuthor() {
        UserEntity admin = createUser("admin-1", "admin");
        UserEntity originalAuthor = createUser("user-1", "user");
        UserEntity newAuthor = createUser("user-2", "user");
        ArticleEntity article = createArticle("article-1", originalAuthor);

        when(articleRepository.findById("article-1")).thenReturn(Optional.of(article));
        when(userRepository.findById("user-2")).thenReturn(Optional.of(newAuthor));
        when(articleRepository.save(any(ArticleEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = articleService.updateArticle(
                "article-1",
                new UpdateArticleRequestDto(null, null, null, null, "user-2", null),
                admin
        );

        assertEquals("user-2", response.authorId());
    }

    private UserEntity createUser(String id, String role) {
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setUsername(id);
        user.setEmail(id + "@company.ru");
        user.setRole(role);
        user.setFullName("User " + id);
        user.setPasswordHash("hash");
        user.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        return user;
    }

    private ArticleEntity createArticle(String id, UserEntity author) {
        CategoryEntity category = new CategoryEntity();
        category.setId("category-1");
        category.setName("Категория");
        category.setSlug("category");
        category.setDescription("Описание");
        category.setArticleCount(1);

        ArticleEntity article = new ArticleEntity();
        article.setId(id);
        article.setTitle("Статья");
        article.setContent("Текст");
        article.setExcerpt("Кратко");
        article.setCategory(category);
        article.setAuthor(author);
        article.setTags(new String[]{"test"});
        article.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        article.setUpdatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        return article;
    }
}
