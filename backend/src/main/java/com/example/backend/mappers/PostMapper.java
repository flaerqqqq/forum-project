package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.PostDto;
import com.example.backend.dto.PostResponseDto;
import com.example.backend.exceptions.CategoryNotFoundException;
import com.example.backend.exceptions.PostImageNotFoundException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.models.Category;
import com.example.backend.models.Post;
import com.example.backend.models.PostImage;
import com.example.backend.models.User;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.PostImageRepository;
import com.example.backend.repositories.UserRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class, uses = {
        CategoryMapper.class,
        UserMapper.class
})
public abstract class PostMapper {

    @Autowired
    private PostImageRepository postImageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Mapping(source = "creator.id", target = "creatorId")
    @Mapping(source = "category.id", target = "categoryId")
    public abstract PostDto toDto(Post entity);

    public abstract Post toEntity(PostDto dto);

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
}