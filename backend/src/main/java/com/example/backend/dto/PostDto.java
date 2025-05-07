package com.example.backend.dto;

import com.example.backend.models.Commentary;
import com.example.backend.models.PostImage;
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

    private List<PostImageDto> images;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long creatorId;

    private Long categoryId;

    private List<Commentary> commentaries;
}