package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.UserBanDataDto;
import com.example.backend.dto.UserBanDataResponseDto;
import com.example.backend.exceptions.CategoryNotFoundException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.models.Category;
import com.example.backend.models.User;
import com.example.backend.models.UserBanData;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class, uses = {
        UserMapper.class
})
@RequiredArgsConstructor
public abstract class UserBanDataMapper {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Mapping(source = "moderator.publicId", target = "moderatorPublicId")
    @Mapping(source = "bannedUser.publicId", target = "bannedUserPublicId")
    @Mapping(source = "category.id", target = "categoryId")
    public abstract UserBanDataDto toDto(UserBanData entity);

    public abstract UserBanData toEntity(UserBanDataDto dto);

    public abstract UserBanDataResponseDto toResponseDto(UserBanData entity);

    public User resolveUser(String publicId) {
        if (publicId == null) return null;
        return userRepository.findByPublicId(publicId).orElseThrow(() -> new UserNotFoundException());
    }

    public Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId).orElseThrow(() -> new CategoryNotFoundException());
    }
}