package ru.mirea.rksp.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.mirea.rksp.backend.dto.category.CategoryDetailsResponseDto;
import ru.mirea.rksp.backend.dto.category.CategoryResponseDto;
import ru.mirea.rksp.backend.service.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryResponseDto> getAll() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{slug}")
    public CategoryDetailsResponseDto getBySlug(@PathVariable String slug) {
        return categoryService.getCategoryDetails(slug);
    }
}
