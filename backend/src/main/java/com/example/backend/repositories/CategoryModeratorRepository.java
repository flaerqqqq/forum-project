package com.example.backend.repositories;

import com.example.backend.dto.CategoryModeratorDto;
import com.example.backend.models.Category;
import com.example.backend.models.CategoryModerator;
import com.example.backend.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryModeratorRepository extends JpaRepository<CategoryModerator, Long> {

    @Query("""
    SELECT count(m) > 0 FROM CategoryModerator m
    WHERE (m.user = :user)
    AND (m.category = :category)  
    AND (m.role = "OWNER")
    """)
    boolean isCategoryOwner(@Param("user") User user, @Param("category") Category category);

    @Query("""
    SELECT count(m) > 0 FROM CategoryModerator m
    WHERE (m.user = :user)
    AND (m.category = :category)  
    AND (m.role = "MODERATOR")
    """)
    boolean isCategoryModerator(User user, Category category);

    void deleteByUserAndCategory(User user, Category category);

    Page<CategoryModerator> findAllByCategory(Category category, Pageable pageable);
}