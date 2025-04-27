package com.example.backend.dto;

import com.example.backend.models.enums.CategoryModeratorRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryModeratorDto {

    private Long id;

    private String userId;

    private Long categoryId;

    private CategoryModeratorRole role;

    private LocalDateTime assignedAt;
}