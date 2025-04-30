package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.*;
import com.example.backend.exceptions.CategoryNotFoundException;
import com.example.backend.exceptions.PostImageNotFoundException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.models.*;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.PostImageRepository;
import com.example.backend.repositories.UserRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class)
public abstract class PostMapper {

    @Autowired
    private PostImageRepository postImageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Mapping(source = "creator.id", target = "creatorId")
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "postImages", target = "imageUrls")
    public abstract PostDto toDto(Post entity);

    public abstract Post toEntity(PostDto dto);

    @Mapping(source = "creatorId", target = "creator")
    @Mapping(source = "categoryId", target = "category")
    public abstract PostResponseDto toResponseDto(PostDto dto);

    public String resolveImageUrl(PostImage image) {
        if (image == null) return null;
        return image.getUrl();
    }

    public PostImage resolveImageEntity(String url) {
        if (url == null) return null;
        return postImageRepository.findByUrl(url).orElseThrow(() -> new PostImageNotFoundException());
    }

    public User resolveUser(Long userId) {
        if (userId == null) return null;
        return userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException());
    }

    public Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId).orElseThrow(() -> new CategoryNotFoundException());
    }

    public UserResponseDto resolveUserResponseDto(Long userId) {
        if (userId == null) return null;
        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException());
        UserResponseDto userResponseDto = modelMapper.map(user, UserResponseDto.class);
        userResponseDto.setRoles(user.getRoles().stream()
                .map(role -> RoleDto.builder().id(role.getId()).name(role.getName()).build())
                .toList());
        return userResponseDto;
    }

    public CategoryResponseDto resolveCategoryResponseDto(Long categoryId) {
        if (categoryId == null) return null;
        Category category = categoryRepository.findById(categoryId).orElseThrow(() -> new CategoryNotFoundException());
        CategoryResponseDto categoryResponseDto = modelMapper.map(category, CategoryResponseDto.class);
        categoryResponseDto.setCreatorId(category.getCreatedBy().getPublicId());
        return categoryResponseDto;
    }
}