package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateUserProfileDto {

    @NotBlank(message = "Display name cannot be blank")
    @Length(min = 3, message = "Minimum length of display name is 3 characters")
    private String displayName;

    @Length(max = 250, message = "Maximum length of a description cannot exceed 250 characters")
    private String description;

}