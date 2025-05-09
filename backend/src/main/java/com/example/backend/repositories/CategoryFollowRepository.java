package com.example.backend.repositories;

import com.example.backend.models.Category;
import com.example.backend.models.CategoryFollow;
import com.example.backend.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Set;

public interface CategoryFollowRepository extends JpaRepository<CategoryFollow, Long> {

    boolean existsByUserAndCategory(User user, Category category);

    Page<CategoryFollow> findAllByCategory(Category category, Pageable pageable);

    Page<CategoryFollow> findAllByUser(User user, Pageable pageable);

    Optional<CategoryFollow> findByUserAndCategory(User user, Category category);

    @Query("""
            SELECT cf.category.slug FROM CategoryFollow cf
            WHERE (cf.user = :user)
            """)
    Set<String> findFollowedCategoriesByUser(@Param("user") User user);
}