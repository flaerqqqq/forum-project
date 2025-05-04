package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.PostImageDto;
import com.example.backend.dto.PostImageResponseDto;
import com.example.backend.exceptions.PostNotFoundException;
import com.example.backend.models.Post;
import com.example.backend.models.PostImage;
import com.example.backend.repositories.PostRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class)
public abstract class PostImageMapper {

    @Autowired
    private PostRepository postRepository;

    @Mapping(source = "post.id", target = "postId")
    public abstract PostImageDto toDto(PostImage entity);

    public abstract PostImage toEntity(PostImageDto dto);

    public abstract PostImageResponseDto toResponseDto(PostImageDto dto);

    public Post resolvePost(Long postId) {
        if (postId == null) return null;
        return postRepository.findById(postId).orElseThrow(() -> new PostNotFoundException());
    }
}