package com.example.backend.controllers;

import com.example.backend.dto.*;
import com.example.backend.mappers.CategoryMapper;
import com.example.backend.models.enums.ReportReason;
import com.example.backend.models.enums.ReportStatus;
import com.example.backend.models.enums.ReportTargetType;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.services.*;
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
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryFollowService categoryFollowService;
    private final CategoryMapper categoryMapper;
    private final CategoryModeratorService categoryModeratorService;
    private final CategorySearchService categorySearchService;
    private final ReportService reportService;

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

    @PutMapping("/{categoryId:\\d+}")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_MODERATOR')")
    public ResponseEntity<CategoryResponseDto> update(@RequestPart("data") @Valid CategoryUpdateRequestDto request,
                                                      @PathVariable Long categoryId,
                                                      @RequestParam(value = "icon", required = false) MultipartFile iconFile,
                                                      @RequestParam(value = "banner", required = false) MultipartFile bannerFile) {
        CategoryResponseDto response = categoryMapper.toResponseDto(
                categoryService.update(categoryId, request, iconFile, bannerFile));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{categoryId:\\d+}")
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

    @DeleteMapping("/{categoryId:\\d+}")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_MODERATOR')")
    public ResponseEntity<Void> deleteCategoryById(@PathVariable Long categoryId,
                                                   @AuthenticationPrincipal CustomUserDetails userDetails) {
        categoryService.deleteCategoryById(userDetails.getPublicId(), categoryId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{categoryId:\\d+}/follows")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<CategoryFollowDto> follow(@PathVariable Long categoryId,
                                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        CategoryFollowDto response = categoryFollowService.follow(userDetails.getPublicId(), categoryId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{categoryId:\\d+}/follows")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<Void> unfollow(@PathVariable Long categoryId,
                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        categoryFollowService.deleteFollow(userDetails.getPublicId(), categoryId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{categoryId:\\d+}/follows/{publicId}")
    public ResponseEntity<CategoryFollowDto> getUserCategoryFollow(@PathVariable Long categoryId,
                                                                   @PathVariable String publicId) {
        CategoryFollowDto userCategoryFollow = categoryFollowService.getUserCategoryFollow(categoryId, publicId);
        return ResponseEntity.ok(userCategoryFollow);
    }

    @GetMapping("/{categoryId:\\d+}/follows")
    public ResponseEntity<Page<CategoryFollowDto>> getCategoryFollows(@PathVariable Long categoryId,
                                                                      Pageable pageable) {
        Page<CategoryFollowDto> followersPage = categoryFollowService.getCategoryFollowersPage(categoryId, pageable);
        if (followersPage.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(followersPage);
    }

    @PutMapping("/{categoryId:\\d+}/follows")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<CategoryFollowDto> update(@PathVariable Long categoryId,
                                                    @RequestBody CategoryFollowUpdateRequestDto request,
                                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        CategoryFollowDto categoryFollowDto = categoryFollowService.updateFollow(userDetails.getPublicId(), categoryId, request);
        return ResponseEntity.ok(categoryFollowDto);
    }

    @PostMapping("/{categoryId:\\d+}/moderators")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<CategoryModeratorDto> addModerator(@PathVariable Long categoryId,
                                                             @RequestBody @Valid CategoryModeratorCreateRequestDto request,
                                                             @AuthenticationPrincipal CustomUserDetails userDetails) {
        CategoryModeratorDto response = categoryModeratorService.addModerator(userDetails.getPublicId(), request.getPublicId(), categoryId);
        URI uri = URI.create("/api/v1/categories/%d/moderators/%d".formatted(categoryId, response.getId()));
        return ResponseEntity.created(uri).body(response);
    }

    @DeleteMapping("/{categoryId:\\d+}/moderators/{moderatorPublicId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<Void> deleteModerator(@PathVariable Long categoryId,
                                                @PathVariable String moderatorPublicId,
                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        categoryModeratorService.deleteModerator(userDetails.getPublicId(), moderatorPublicId, categoryId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{categoryId:\\d+}/moderators")
    public ResponseEntity<Page<CategoryModeratorDto>> getCategoryModerators(@PathVariable Long categoryId,
                                                                            Pageable pageable) {
        Page<CategoryModeratorDto> pageOfModerators = categoryModeratorService.getCategoryModerators(categoryId, pageable);
        if (pageOfModerators.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(pageOfModerators);
    }

    @GetMapping("/{categoryId:\\d+}/moderators/{moderatorPublicId}")
    public ResponseEntity<List<CategoryModeratorDto>> getModeratorById(@PathVariable Long categoryId,
                                                                       @PathVariable String moderatorPublicId) {
        List<CategoryModeratorDto> response = categoryModeratorService.getModeratorByPublicId(moderatorPublicId, categoryId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{categorySlug}/moderators/{moderatorPublicId}")
    public ResponseEntity<List<CategoryModeratorDto>> getModeratorsBySlug(@PathVariable String categorySlug,
                                                                       @PathVariable String moderatorPublicId) {
        List<CategoryModeratorDto> response = categoryModeratorService.getModeratorByPublicId(moderatorPublicId, categorySlug);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{categoryId:\\d+}/moderators/{moderatorPublicId}/roles")
    public ResponseEntity<ModeratorRoleInfoDto> getModeratorRoles(@PathVariable Long categoryId,
                                                                  @PathVariable String moderatorPublicId) {
        ModeratorRoleInfoDto response = categoryModeratorService.getModeratorRoles(moderatorPublicId, categoryId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<CategoryResponseDto>> searchCategory(@RequestParam("query") String rawQuery,
                                                                    @RequestParam(value = "creatorPublicId", required = false) String creatorPublicId) {
        List<CategoryDto> listOfCategories = categorySearchService.searchCategoriesBySlugOrName(rawQuery, creatorPublicId);
        if (listOfCategories.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(listOfCategories.stream()
                .map(categoryMapper::toResponseDto)
                .toList()
        );
    }

    @GetMapping("/slug/{categorySlug}/access")
    public ResponseEntity<Boolean> checkAccessToCategory(@PathVariable("categorySlug") String categorySlug,
                                                         @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        Boolean isAllowed = categoryService.checkAccessToCategory(customUserDetails != null ? customUserDetails.getPublicId() : null, categorySlug);
        return ResponseEntity.ok(isAllowed);
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/slug/{categorySlug}/reports/{reportId}")
    public ResponseEntity<ReportDto> findReportById(@PathVariable String categorySlug,
                                                    @PathVariable Long reportId) {
        ReportDto response = reportService.findReportByIdAndCategory(reportId, categorySlug);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/slug/{categorySlug}/reports")
    public ResponseEntity<Page<ReportDto>> findCategoryReports(@PathVariable String categorySlug,
                                                               @RequestParam(required = false) ReportStatus status,
                                                               @RequestParam(required = false) ReportTargetType targetType,
                                                               @RequestParam(required = false) ReportReason reason,
                                                               @RequestParam(required = false) String reporterId,
                                                               Pageable pageable) {
        Page<ReportDto> categoryReports = reportService.findReportsForCategory(categorySlug, pageable, targetType, reason, status, reporterId);
        if (categoryReports.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(categoryReports);
    }

    @PostMapping("/slug/{categorySlug}/ban/{targetUserPublicId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<UserBanDataDto> banUserInCategory(@PathVariable String categorySlug,
                                                            @PathVariable String targetUserPublicId,
                                                            @RequestBody UserBanRequestDto request,
                                                            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        UserBanDataDto userBanData = categoryService.banUser(request, customUserDetails.getPublicId(), targetUserPublicId, categorySlug);
        return ResponseEntity.ok(userBanData);
    }

    @DeleteMapping("/slug/{categorySlug}/unban/{targetUserPublicId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<Void> unbanUserInCategory(@PathVariable String categorySlug,
                                                    @PathVariable String targetUserPublicId,
                                                    @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        categoryService.unbanUser(customUserDetails.getPublicId(), targetUserPublicId, categorySlug);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{categorySlug}/banned")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<Page<UserBanDataResponseDto>> getBannedUsersInCategory(Pageable pageable,
                                                                                 @PathVariable String categorySlug,
                                                                                 @RequestParam(value = "username", required = false) String username,
                                                                                 @RequestParam(value = "isPermanentBan", required = false) Boolean isPermanentBan,
                                                                                 @RequestParam(value = "unbanTimeStart", required = false) LocalDateTime unbanTimeStart,
                                                                                 @RequestParam(value = "unbanTimeEnd", required = false) LocalDateTime unbanTimeEnd) {
        Page<UserBanDataResponseDto> bannedUsers = categoryService.findBannedUsers(pageable, categorySlug, username, isPermanentBan, unbanTimeStart, unbanTimeEnd);
        if (bannedUsers.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(bannedUsers);
    }

    @PutMapping("/{categorySlug}/update-ban/{targetUserPublicId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<UserBanDataResponseDto> updateBanData(@RequestBody UserBanRequestDto request,
                                                                @PathVariable String categorySlug,
                                                                @PathVariable String targetUserPublicId,
                                                                @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        UserBanDataResponseDto userBanData = categoryService.updateBanData(request, customUserDetails.getPublicId(), targetUserPublicId, categorySlug);
        return ResponseEntity.ok(userBanData);
    }

}