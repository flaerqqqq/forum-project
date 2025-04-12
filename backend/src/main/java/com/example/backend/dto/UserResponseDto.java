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
public class UserResponseDto {

    private String publicId;

    private String username;

    private String displayName;

    private String email;

    private String description;

    private Long postsCount;

    private Long receivedLikesCount;

    private Long receivedDislikesCount;

    private Long userRating;

    private String avatarUrl;

    private LocalDateTime registrationDate;

    private LocalDateTime lastUpdatedAt;

    private List<RoleDto> roles;
}