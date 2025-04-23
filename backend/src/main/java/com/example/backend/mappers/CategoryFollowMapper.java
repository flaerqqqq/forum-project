package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.CategoryFollowDto;
import com.example.backend.exceptions.CategoryNotFoundException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.models.Category;
import com.example.backend.models.CategoryFollow;
import com.example.backend.models.User;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.UserRepository;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class)
public abstract class CategoryFollowMapper {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "category.id", target = "categoryId")
    abstract CategoryFollowDto toDto(CategoryFollow entity);

    @InheritInverseConfiguration
    abstract CategoryFollow toEntity(CategoryFollowDto dto);

    public User resolveUser(Long userId) {
        if (userId == null) return null;
        return userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException());
    }

    public Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId).orElseThrow(() -> new CategoryNotFoundException());
    }
}