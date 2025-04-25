package com.example.backend.controllers;

import com.example.backend.dto.*;
import com.example.backend.mappers.CategoryMapper;
import com.example.backend.models.CategoryModerator;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.services.CategoryFollowService;
import com.example.backend.services.CategoryModeratorService;
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
    private final CategoryModeratorService categoryModeratorService;

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

    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryResponseDto> getCategoryById(@PathVariable Long categoryId) {
        CategoryDto categoryDto = categoryService.findCategoryById(categoryId);
        return ResponseEntity.ok(categoryMapper.toResponseDto(categoryDto));
    }

    @GetMapping("/slug/{categorySlug}")
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

    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_MODERATOR')")
    public ResponseEntity<Void> deleteCategoryById(@PathVariable Long categoryId,
                                                   @AuthenticationPrincipal CustomUserDetails userDetails) {
        categoryService.deleteCategoryById(userDetails.getPublicId(), categoryId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{categoryId}/follows")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<CategoryFollowDto> follow(@PathVariable Long categoryId,
                                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        CategoryFollowDto response = categoryFollowService.follow(userDetails.getPublicId(), categoryId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{categoryId}/follows")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<Void> unfollow(@PathVariable Long categoryId,
                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        categoryFollowService.deleteFollow(userDetails.getPublicId(), categoryId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{categoryId}/follows")
    public ResponseEntity<Page<CategoryFollowDto>> getCategoryFollows(@PathVariable Long categoryId,
                                                                      Pageable pageable) {
        Page<CategoryFollowDto> followersPage = categoryFollowService.getCategoryFollowersPage(categoryId, pageable);
        if (followersPage.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(followersPage);
    }

    @PutMapping("/{categoryId}/follows")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<CategoryFollowDto> update(@PathVariable Long categoryId,
                                                    @RequestBody CategoryFollowUpdateRequestDto request,
                                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        CategoryFollowDto categoryFollowDto = categoryFollowService.updateFollow(userDetails.getPublicId(), categoryId, request);
        return ResponseEntity.ok(categoryFollowDto);
    }

    // add category moderator
    @PostMapping("/{categoryId}/moderators")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<CategoryModeratorDto> addModerator(@PathVariable Long categoryId,
                                                             @RequestBody @Valid CategoryModeratorCreateRequestDto request,
                                                             @AuthenticationPrincipal CustomUserDetails userDetails) {
        CategoryModeratorDto response = categoryModeratorService.addModerator(userDetails.getPublicId(), request.getPublicId(), categoryId);
        URI uri = URI.create("/api/v1/categories/%d/moderators/%d".formatted(categoryId, response.getId()));
        return ResponseEntity.created(uri).body(response);
    }

    // delete category moderator
    @DeleteMapping("/{categoryId}/moderators/{moderatorPublicId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<Void> deleteModerator(@PathVariable Long categoryId,
                                                @PathVariable String moderatorPublicId,
                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        categoryModeratorService.deleteModerator(userDetails.getPublicId(), moderatorPublicId, categoryId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{categoryId}/moderators")
    public ResponseEntity<Page<CategoryModeratorDto>> getCategoryModerators(@PathVariable Long categoryId,
                                                                            Pageable pageable) {
        Page<CategoryModeratorDto> pageOfModerators = categoryModeratorService.getCategoryModerators(categoryId, pageable);
        if (pageOfModerators.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(pageOfModerators);
    }

    // get all category moderators
    // get category moderator by id
}