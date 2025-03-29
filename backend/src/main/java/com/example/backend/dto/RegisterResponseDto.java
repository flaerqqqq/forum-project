package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
@Builder
public class RegisterResponseDto {

    private String publicId;

    private String username;

    private String displayName;

    private String email;

    private String description;

    private LocalDateTime registrationDate;

    private LocalDateTime lastUpdatedAt;
}