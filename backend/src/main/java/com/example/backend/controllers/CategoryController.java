package com.example.backend.controllers;

import com.example.backend.dto.*;
import com.example.backend.mappers.CategoryMapper;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.services.CategoryFollowService;
import com.example.backend.services.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryFollowService categoryFollowService;
    private final CategoryMapper categoryMapper;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<CategoryResponseDto> create(@RequestPart("data") @Valid CategoryCreateRequestDto request,
                                                      @RequestParam(value = "icon", required = false) MultipartFile iconFile,
                                                      @RequestParam(value = "banner", required = false) MultipartFile bannerFile,
                                                      @AuthenticationPrincipal CustomUserDetails userDetails) {
        CategoryResponseDto response = categoryMapper.toResponseDto(
                categoryService.create(userDetails.getPublicId(), request, iconFile, bannerFile));
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

    @GetMapping("/id/{categoryId}")
    public ResponseEntity<CategoryResponseDto> getCategoryById(@PathVariable Long categoryId) {
        CategoryDto categoryDto = categoryService.findCategoryById(categoryId);
        return ResponseEntity.ok(categoryMapper.toResponseDto(categoryDto));
    }

    @GetMapping("/{categorySlug}")
    public ResponseEntity<CategoryResponseDto> getCategoryBySlug(@PathVariable String categorySlug) {
        CategoryDto categoryDto = categoryService.findCategoryBySlug(categorySlug);
        return ResponseEntity.ok(categoryMapper.toResponseDto(categoryDto));
    }

    @GetMapping
    public ResponseEntity<Page<CategoryResponseDto>> getCategoriesPage(Pageable pageable) {
        Page<CategoryResponseDto> responsePage = categoryService.findCategoriesPage(pageable)
                .map(categoryMapper::toResponseDto);
        if (responsePage.isEmpty())
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        return ResponseEntity.ok(responsePage);
    }

    @PostMapping("/{categoryId}/follows")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<CategoryFollowDto> follow(@PathVariable Long categoryId,
                                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        CategoryFollowDto response = categoryFollowService.follow(userDetails.getPublicId(), categoryId);
        URI uri = URI.create("/api/v1/categories/%d/follows/%d".formatted(categoryId, response.getId()));
        return ResponseEntity.created(uri).body(response);
    }

    @DeleteMapping("/{categoryId}/follows/{followId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<Void> unfollow(@PathVariable Long categoryId,
                                         @PathVariable Long followId,
                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        categoryFollowService.deleteFollow(userDetails.getPublicId(), categoryId, followId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}