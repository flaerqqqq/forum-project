package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryFollowUpdateRequestDto {

    @NotNull(message = "Notification enabled must be not null")
    private Boolean notificationEnabled;
}