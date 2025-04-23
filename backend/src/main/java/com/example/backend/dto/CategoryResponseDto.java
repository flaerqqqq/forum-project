package com.example.backend.dto;

import com.example.backend.models.enums.PostPermission;
import com.example.backend.models.enums.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryResponseDto {

    private Long id;

    private String name;

    private String slug;

    private Visibility visibility;

    private PostPermission postPermission;

    private String description;

    private String bannerUrl;

    private String iconUrl;

    private Long followersCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long creatorId;
}