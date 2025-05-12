package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserCategoryBanRequestDto {

    @NotBlank(message = "Target user publicId must be present")
    private String targetUserPublicId;

    @NotNull(message = "isPermanentBan field must be present")
    private Boolean isPermanentBan;

    @NotNull(message = "Unban time must be present")
    private LocalDateTime unbanAt;

    @NotBlank(message = "Reason must be present")
    private String reason;
}