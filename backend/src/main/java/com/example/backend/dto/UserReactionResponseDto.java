package com.example.backend.dto;

import com.example.backend.models.enums.ReactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserReactionResponseDto {

    private ReactionType type;

    private Long likesCount;

    private Long dislikesCount;
}