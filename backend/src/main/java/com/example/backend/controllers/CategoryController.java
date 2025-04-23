package com.example.backend.controllers;

import com.example.backend.dto.CategoryCreateRequestDto;
import com.example.backend.dto.CategoryDto;
import com.example.backend.dto.CategoryResponseDto;
import com.example.backend.dto.UserDto;
import com.example.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_MODERATOR')")
    public ResponseEntity<CategoryResponseDto> create(@RequestBody CategoryCreateRequestDto request,
                                                      @RequestParam(value = "icon", required = false) MultipartFile iconFile,
                                                      @RequestParam(value = "banner", required = false) MultipartFile bannerFile,
                                                      Authentication authentication) {
        UserDto creator = userService.findByUsername(authentication.getName());
        CategoryDto categoryDto = categoryService.create(....);

    }

}