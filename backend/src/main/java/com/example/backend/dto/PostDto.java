package com.example.backend.dto;

import com.example.backend.models.enums.PostType;
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
public class PostDto {

    private Long id;

    private String title;

    private String body;

    private Long commentsCount;

    private PostType type;

    private List<String> imageUrls;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long userId;

    private Long categoryId;
}