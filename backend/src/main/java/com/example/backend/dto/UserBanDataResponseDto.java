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
public class UserBanDataResponseDto {

    private Long id;

    private Boolean isPermanentBan = false;

    private LocalDateTime unbanAt;

    private LocalDateTime bannedAt;

    private String reason;

    private UserResponseDto moderator;

    private UserResponseDto bannedUser;
}