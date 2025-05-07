package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.CommentaryDto;
import com.example.backend.dto.CommentaryResponseDto;
import com.example.backend.exceptions.CommentaryNotFoundException;
import com.example.backend.exceptions.PostNotFoundException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.models.Commentary;
import com.example.backend.models.Post;
import com.example.backend.models.User;
import com.example.backend.repositories.CommentaryRepository;
import com.example.backend.repositories.PostRepository;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Slf4j
@Mapper(config = MapperConfig.class)
@RequiredArgsConstructor
public abstract class CommentaryMapper {

    @Autowired
    private CommentaryRepository commentaryRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Mapping(source = "parent.id", target = "parentId")
    @Mapping(source = "post.id", target = "postId")
    @Mapping(source = "createdBy.publicId", target = "creatorPublicId")
    @Mapping(target = "replies", ignore = true)
    public abstract CommentaryDto toDto(Commentary entity);

    @Mapping(target = "username", ignore = true)
    @Mapping(source = "creatorPublicId", target = "userPublicId")
    @Mapping(target = "userDisplayName", ignore = true)
    @Mapping(target = "userAvatarUrl", ignore = true)
    @Mapping(target = "replies", ignore = true)
    public abstract CommentaryResponseDto toResponseDto(CommentaryDto dto);

    public abstract Commentary toEntity(CommentaryDto dto);

    public User resolveUser(String userPublicId) {
        if (userPublicId == null) return null;
        return userRepository.findByPublicId(userPublicId).orElseThrow(() -> new UserNotFoundException());
    }

    public Post resolvePost(Long postId) {
        if (postId == null) return null;
        return postRepository.findById(postId).orElseThrow(() -> new PostNotFoundException());
    }

    public Commentary resolveParentCommentary(Long commentaryId) {
        if (commentaryId == null) return null;
        return commentaryRepository.findById(commentaryId).orElseThrow(() -> new CommentaryNotFoundException());
    }

    @AfterMapping
    public void mapEntityRepliesToDto(@MappingTarget CommentaryDto.CommentaryDtoBuilder dto, Commentary entity) {
        if (entity.getReplies() != null && !entity.getReplies().isEmpty()) {
            dto.replies(entity.getReplies().stream()
                    .map(this::toDto)
                    .toList()
            );
        }
    }

    @AfterMapping
    public void mapDtoRepliesToEntity(@MappingTarget Commentary.CommentaryBuilder entity, CommentaryDto target) {
        if (target.getReplies() != null && !target.getReplies().isEmpty()) {
            entity.replies(target.getReplies().stream()
                    .map(this::toEntity)
                    .peek(reply -> reply.setParent(entity.build()))
                    .toList()
            );
        }
    }

    @AfterMapping
    public void mapDtoRepliesToResponse(@MappingTarget CommentaryResponseDto.CommentaryResponseDtoBuilder responseDto, CommentaryDto dto) {
        if (dto.getReplies() != null && !dto.getReplies().isEmpty()) {
            responseDto.replies(dto.getReplies().stream()
                    .map(this::toResponseDto)
                    .toList()
            );
        }
    }

    @AfterMapping
    public void mapUserInfo(@MappingTarget CommentaryResponseDto.CommentaryResponseDtoBuilder responseDto, CommentaryDto dto) {
        if (dto.getCreatorPublicId() != null) {
            userRepository.findByPublicId(dto.getCreatorPublicId())
                    .ifPresent(user -> {
                        responseDto.username(user.getUsername());
                        responseDto.userDisplayName(user.getDisplayName());
                        if (user.getAvatar() != null && user.getAvatar().getUrl() != null) {
                            responseDto.userAvatarUrl(user.getAvatar().getUrl());
                        }
                    });
        }
    }
}