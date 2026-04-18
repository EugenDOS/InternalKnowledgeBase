package ru.mirea.rksp.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.mirea.rksp.backend.dto.category.CategoryDetailsResponseDto;
import ru.mirea.rksp.backend.dto.category.CategoryResponseDto;
import ru.mirea.rksp.backend.entity.ArticleEntity;
import ru.mirea.rksp.backend.entity.CategoryEntity;
import ru.mirea.rksp.backend.mapper.ApiMapper;
import ru.mirea.rksp.backend.repository.ArticleRepository;
import ru.mirea.rksp.backend.repository.CategoryRepository;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;

    public CategoryService(CategoryRepository categoryRepository, ArticleRepository articleRepository) {
        this.categoryRepository = categoryRepository;
        this.articleRepository = articleRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponseDto> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc().stream()
                .map(ApiMapper::toCategoryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryDetailsResponseDto getCategoryDetails(String slug) {
        CategoryEntity category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Категория не найдена"));

        List<ArticleEntity> articles = articleRepository.findByCategory_IdOrderByCreatedAtDesc(category.getId());

        return new CategoryDetailsResponseDto(
                ApiMapper.toCategoryDto(category),
                articles.stream().map(ApiMapper::toArticleDto).toList()
        );
    }
}
