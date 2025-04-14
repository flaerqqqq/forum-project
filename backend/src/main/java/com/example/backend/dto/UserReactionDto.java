package com.example.backend.dto;

import com.example.backend.models.enums.ReactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserReactionDto {

    private Long id;

    private ReactionType type;

    private LocalDateTime createdAt;

    private Long userId;

    private Long targetUserId;
}