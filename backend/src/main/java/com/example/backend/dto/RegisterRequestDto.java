package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegisterRequestDto {

    @NotBlank(message = "Username cannot be blank")
    @Length(min = 3, message = "Minimum length of username is 3 characters")
    private String username;

    @NotBlank(message = "Display name cannot be blank")
    @Length(min = 3, message = "Minimum length of display name is 3 character")
    private String displayName;

    @Email(message = "The field should have an email pattern")
    private String email;
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$",
            message = "Password must be at least 6 characters long, contain at least one letter, one number, and one special character")
    private String password;

    @Length(max = 250, message = "Maximum length of a description cannot exceed 250 characters")
    private String description;
}