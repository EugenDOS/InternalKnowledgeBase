package ru.mirea.rksp.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.mirea.rksp.backend.entity.CategoryEntity;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<CategoryEntity, String> {

    Optional<CategoryEntity> findBySlug(String slug);

    List<CategoryEntity> findAllByOrderByNameAsc();
}
