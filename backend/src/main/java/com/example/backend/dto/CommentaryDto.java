package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentaryDto {

    private Long id;

    private String content;

    private Long parentId;

    private List<CommentaryDto> replies;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String creatorPublicId;

    private Long postId;
}