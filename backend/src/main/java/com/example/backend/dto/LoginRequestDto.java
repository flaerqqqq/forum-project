package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
@Builder
public class LoginRequestDto {

    @NotBlank(message = "Username field cannot be empty")
    private String username;

    @NotBlank(message = "Password field cannot be empty")
    private String password;
}