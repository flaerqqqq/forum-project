package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.CategoryModeratorDto;
import com.example.backend.dto.UserResponseDto;
import com.example.backend.exceptions.CategoryNotFoundException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.models.Category;
import com.example.backend.models.CategoryModerator;
import com.example.backend.models.User;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.UserRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class)
public abstract class CategoryModeratorMapper {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    public abstract CategoryModerator toEntity(CategoryModeratorDto dto);

    @Mapping(source = "user.publicId", target = "userDto")
    @Mapping(source = "category.id", target = "categoryId")
    public abstract CategoryModeratorDto toDto(CategoryModerator entity);

    public UserResponseDto resolverUser(String userId) {
        if (userId == null) return null;
        User user = userRepository.findByPublicId(userId).orElseThrow(() -> new UserNotFoundException());
        UserResponseDto userResponseDto = modelMapper.map(user, UserResponseDto.class);
        userResponseDto.setAvatarUrl(user.getAvatar() != null ? user.getAvatar().getUrl() : null);
        userResponseDto.setRoles(user.getRoles().stream().map(roleMapper::toDto).toList());
        return userResponseDto;
    }

    public Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId).orElseThrow(() -> new CategoryNotFoundException());
    }
}