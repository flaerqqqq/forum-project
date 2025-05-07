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
public class CommentaryResponseDto {

    private Long id;

    private String content;

    private String username;

    private String userPublicId;

    private String userDisplayName;

    private String userAvatarUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<CommentaryResponseDto> replies;

}