package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.CategoryModeratorDto;
import com.example.backend.exceptions.CategoryNotFoundException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.models.Category;
import com.example.backend.models.CategoryModerator;
import com.example.backend.models.User;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.UserRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class)
public abstract class CategoryModeratorMapper {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    abstract CategoryModerator toEntity(CategoryModeratorDto dto);

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "category.id", target = "categoryId")
    abstract CategoryModeratorDto toDto(CategoryModerator entity);

    public User resolverUser(Long userId) {
        if (userId == null) return null;
        return userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException());
    }

    public Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId).orElseThrow(() -> new CategoryNotFoundException());
    }
}