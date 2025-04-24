package com.example.backend.repositories;

import com.example.backend.models.Category;
import com.example.backend.models.CategoryFollow;
import com.example.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryFollowRepository extends JpaRepository<CategoryFollow, Long> {

    boolean existsByUserAndCategory(User user, Category category);
}