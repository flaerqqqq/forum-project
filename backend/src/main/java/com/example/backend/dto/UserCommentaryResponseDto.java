package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserCommentaryResponseDto {

    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String categorySlug;
    private String categoryName;
    private String categoryIconUrl;

    private String creatorPublicId;
    private String creatorAvatarUrl;
    private String creatorDisplayName;

    private Long postId;
    private String postTitle;

    private String parentCommentUsername;
}