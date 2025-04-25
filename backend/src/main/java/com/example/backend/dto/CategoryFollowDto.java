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
public class CategoryFollowDto {

    private Long id;

    private Long categoryId;

    private Long userId;

    private LocalDateTime followedAt;

    private LocalDateTime updatedAt;

    private Boolean notificationEnabled;
}