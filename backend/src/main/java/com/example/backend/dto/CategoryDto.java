package com.example.backend.dto;

import com.example.backend.models.CategoryModerator;
import com.example.backend.models.enums.PostPermission;
import com.example.backend.models.enums.Visibility;
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
public class CategoryDto {

    private Long id;

    private String name;

    private String slug;

    private Visibility visibility;

    private PostPermission postPermission;

    private String description;

    private String bannerUrl;

    private String iconUrl;

    private Long followersCount = 0L;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long creatorId;

    private List<CategoryFollowDto> followers;

    private List<CategoryModeratorDto> categoryModerators;
}