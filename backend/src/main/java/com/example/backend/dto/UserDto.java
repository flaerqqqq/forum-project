package com.example.backend.dto;

import com.example.backend.models.Avatar;
import com.example.backend.models.Report;
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
public class UserDto {

    private Long id;

    private String publicId;

    private String username;

    private String displayName;

    private String email;

    private String password;

    private String description;

    private Long postsCount;

    private Long receivedLikesCount;

    private Long receivedDislikesCount;

    private Long userRating;

    private LocalDateTime registrationDate;

    private LocalDateTime lastUpdatedAt;

    private Boolean isEmailVerified;

    private List<RoleDto> roles;

    private Avatar avatarDto;

    private List<UserReactionDto> userReactions;

    private List<UserReactionDto> receivedUserReactions;

    private List<Report> sentReports;

    private List<CategoryDto> createdCategories;

    private List<CategoryFollowDto> followedCategories;

    private List<CategoryModeratorDto> moderatedCategories;

    private List<PostDto> posts;

    private List<CommentaryDto> commentaries;
}