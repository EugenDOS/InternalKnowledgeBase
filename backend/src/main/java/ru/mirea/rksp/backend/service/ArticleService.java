package ru.mirea.rksp.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.mirea.rksp.backend.dto.article.ArticleResponseDto;
import ru.mirea.rksp.backend.dto.article.CreateArticleRequestDto;
import ru.mirea.rksp.backend.dto.article.UpdateArticleRequestDto;
import ru.mirea.rksp.backend.entity.ArticleEntity;
import ru.mirea.rksp.backend.entity.CategoryEntity;
import ru.mirea.rksp.backend.entity.UserEntity;
import ru.mirea.rksp.backend.mapper.ApiMapper;
import ru.mirea.rksp.backend.repository.ArticleRepository;
import ru.mirea.rksp.backend.repository.CategoryRepository;
import ru.mirea.rksp.backend.repository.UserRepository;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ArticleService(
            ArticleRepository articleRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository
    ) {
        this.articleRepository = articleRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ArticleResponseDto> getArticles(String query) {
        List<ArticleEntity> articles;

        if (query == null || query.isBlank()) {
            articles = articleRepository.findAllByOrderByCreatedAtDesc();
        } else {
            articles = articleRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(query.trim());
        }

        return articles.stream()
                .map(ApiMapper::toArticleDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ArticleResponseDto getArticleById(String id) {
        ArticleEntity article = findArticle(id);
        return ApiMapper.toArticleDto(article);
    }

    @Transactional
    public ArticleResponseDto createArticle(CreateArticleRequestDto request, UserEntity currentUser) {
        String title = requireText(request.title(), "Поля title, categoryId, authorId обязательны");
        String categoryId = requireText(request.categoryId(), "Поля title, categoryId, authorId обязательны");
        String authorId = requireText(request.authorId(), "Поля title, categoryId, authorId обязательны");

        if (!isAdmin(currentUser) && !authorId.equals(currentUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Нет прав: нельзя создавать статьи от имени другого пользователя"
            );
        }

        CategoryEntity category = findCategory(categoryId);
        UserEntity author = isAdmin(currentUser)
                ? findUser(authorId)
                : currentUser;

        ArticleEntity article = new ArticleEntity();
        article.setTitle(title);
        article.setContent(defaultText(request.content()));
        article.setExcerpt(defaultText(request.excerpt()));
        article.setCategory(category);
        article.setAuthor(author);
        article.setTags(normalizeTags(request.tags()));
        article.setCreatedAt(Instant.now());
        article.setUpdatedAt(Instant.now());

        ArticleEntity savedArticle = articleRepository.save(article);
        return ApiMapper.toArticleDto(savedArticle);
    }

    @Transactional
    public ArticleResponseDto updateArticle(String id, UpdateArticleRequestDto request, UserEntity currentUser) {
        ArticleEntity article = findArticle(id);
        ensureCanManageArticle(article, currentUser);

        if (request.title() != null) {
            article.setTitle(requireText(request.title(), "Название статьи не может быть пустым"));
        }

        if (request.content() != null) {
            article.setContent(request.content().trim());
        }

        if (request.excerpt() != null) {
            article.setExcerpt(request.excerpt().trim());
        }

        if (request.categoryId() != null) {
            article.setCategory(findCategory(requireText(request.categoryId(), "categoryId не может быть пустым")));
        }

        if (request.authorId() != null) {
            String requestedAuthorId = requireText(request.authorId(), "authorId не может быть пустым");

            if (!isAdmin(currentUser) && !requestedAuthorId.equals(currentUser.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Нет прав: нельзя менять автора статьи");
            }

            article.setAuthor(isAdmin(currentUser) ? findUser(requestedAuthorId) : currentUser);
        }

        if (request.tags() != null) {
            article.setTags(normalizeTags(request.tags()));
        }

        article.setUpdatedAt(Instant.now());

        ArticleEntity savedArticle = articleRepository.save(article);
        return ApiMapper.toArticleDto(savedArticle);
    }

    @Transactional
    public void deleteArticle(String id, UserEntity currentUser) {
        ArticleEntity article = findArticle(id);
        ensureCanManageArticle(article, currentUser);
        articleRepository.delete(article);
    }

    private ArticleEntity findArticle(String id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Статья не найдена"));
    }

    private CategoryEntity findCategory(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Категория не найдена"));
    }

    private UserEntity findUser(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь не найден"));
    }

    private void ensureCanManageArticle(ArticleEntity article, UserEntity currentUser) {
        if (isAdmin(currentUser)) {
            return;
        }

        if (!Objects.equals(article.getAuthor().getId(), currentUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Нет прав: можно редактировать и удалять только свои статьи"
            );
        }
    }

    private boolean isAdmin(UserEntity user) {
        return "admin".equals(user.getRole());
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }

        return value.trim();
    }

    private String defaultText(String value) {
        return value == null ? "" : value.trim();
    }

    private String[] normalizeTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return new String[0];
        }

        return tags.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(tag -> !tag.isEmpty())
                .distinct()
                .toArray(String[]::new);
    }
}
