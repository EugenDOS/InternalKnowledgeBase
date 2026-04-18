package ru.mirea.rksp.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import ru.mirea.rksp.backend.dto.article.ArticleResponseDto;
import ru.mirea.rksp.backend.dto.article.CreateArticleRequestDto;
import ru.mirea.rksp.backend.dto.article.UpdateArticleRequestDto;
import ru.mirea.rksp.backend.dto.common.MessageResponseDto;
import ru.mirea.rksp.backend.entity.UserEntity;
import ru.mirea.rksp.backend.service.ArticleService;
import ru.mirea.rksp.backend.service.AuthService;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;
    private final AuthService authService;

    public ArticleController(ArticleService articleService, AuthService authService) {
        this.articleService = articleService;
        this.authService = authService;
    }

    @GetMapping
    public List<ArticleResponseDto> getAll(@RequestParam(value = "q", required = false) String query) {
        return articleService.getArticles(query);
    }

    @GetMapping("/{id}")
    public ArticleResponseDto getById(@PathVariable String id) {
        return articleService.getArticleById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ArticleResponseDto create(@RequestBody CreateArticleRequestDto request, HttpServletRequest httpRequest) {
        UserEntity currentUser = authService.requireCurrentUser(httpRequest);
        return articleService.createArticle(request, currentUser);
    }

    @PutMapping("/{id}")
    public ArticleResponseDto update(
            @PathVariable String id,
            @RequestBody UpdateArticleRequestDto request,
            HttpServletRequest httpRequest
    ) {
        UserEntity currentUser = authService.requireCurrentUser(httpRequest);
        return articleService.updateArticle(id, request, currentUser);
    }

    @DeleteMapping("/{id}")
    public MessageResponseDto delete(@PathVariable String id, HttpServletRequest httpRequest) {
        UserEntity currentUser = authService.requireCurrentUser(httpRequest);
        articleService.deleteArticle(id, currentUser);
        return new MessageResponseDto("Статья удалена");
    }
}
