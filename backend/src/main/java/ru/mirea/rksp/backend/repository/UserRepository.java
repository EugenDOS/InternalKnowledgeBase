package ru.mirea.rksp.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.mirea.rksp.backend.entity.UserEntity;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, String> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<UserEntity> findAllByOrderByCreatedAtAsc();
}
