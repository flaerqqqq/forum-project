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
public class UserBanDataDto {

    private Long id;

    private Boolean isPermanentBan = false;

    private Boolean isCategoryBan = false;

    private Long categoryId;

    private LocalDateTime unbanAt;

    private LocalDateTime bannedAt;

    private String reason;

    private String moderatorPublicId;

    private String bannedUserPublicId;
}