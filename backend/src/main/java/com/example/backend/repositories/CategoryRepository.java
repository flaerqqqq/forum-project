package com.example.backend.repositories;

import com.example.backend.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsBySlug(String slug);

    Optional<Category> findBySlug(String categorySlug);
}