package com.example.backend.controllers;

import com.example.backend.dto.CategoryCreateRequestDto;
import com.example.backend.dto.CategoryResponseDto;
import com.example.backend.dto.CategoryUpdateRequestDto;
import com.example.backend.dto.UserDto;
import com.example.backend.mappers.CategoryMapper;
import com.example.backend.services.CategoryService;
import com.example.backend.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_MODERATOR')")
    public ResponseEntity<CategoryResponseDto> create(@RequestPart("data") @Valid CategoryCreateRequestDto request,
                                                      @RequestParam(value = "icon", required = false) MultipartFile iconFile,
                                                      @RequestParam(value = "banner", required = false) MultipartFile bannerFile,
                                                      Authentication authentication) {
        UserDto creator = userService.findByUsername(authentication.getName());
        CategoryResponseDto response = categoryMapper.toResponseDto(
                categoryService.create(creator.getPublicId(), request, iconFile, bannerFile));
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{categoryId}")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_MODERATOR')")
    public ResponseEntity<CategoryResponseDto> update(@RequestPart("data") @Valid CategoryUpdateRequestDto request,
                                                      @PathVariable Long categoryId,
                                                      @RequestParam(value = "icon", required = false) MultipartFile iconFile,
                                                      @RequestParam(value = "banner", required = false) MultipartFile bannerFile) {
        CategoryResponseDto response = categoryMapper.toResponseDto(
                categoryService.update(categoryId, request, iconFile, bannerFile));
        return ResponseEntity.ok(response);
    }
}