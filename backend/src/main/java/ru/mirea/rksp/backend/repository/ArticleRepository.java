package ru.mirea.rksp.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.mirea.rksp.backend.entity.ArticleEntity;

import java.util.List;

public interface ArticleRepository extends JpaRepository<ArticleEntity, String> {

    List<ArticleEntity> findAllByOrderByCreatedAtDesc();

    List<ArticleEntity> findByCategory_IdOrderByCreatedAtDesc(String categoryId);

    List<ArticleEntity> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title);
}
