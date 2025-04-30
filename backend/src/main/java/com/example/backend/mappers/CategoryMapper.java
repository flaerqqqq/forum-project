package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.CategoryDto;
import com.example.backend.dto.CategoryResponseDto;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.models.Category;
import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class, uses = {
        CategoryFollowMapper.class,
        CategoryModeratorMapper.class
})
public abstract class CategoryMapper {

    @Autowired
    private UserRepository userRepository;

    abstract Category toEntity(CategoryDto categoryDto);

    @Mapping(source = "createdBy.publicId", target = "creatorId")
    public abstract CategoryDto toDto(Category category);

    public abstract CategoryResponseDto toResponseDto(CategoryDto dto);

    public User resolverUser(String userId) {
        if (userId == null) return null;
        return userRepository.findByPublicId(userId).orElseThrow(() -> new UserNotFoundException());
    }
}