package com.example.backend.services;

import com.example.backend.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

public interface CategoryService {

    CategoryDto create(String creatorPublicId,
                       CategoryCreateRequestDto request,
                       MultipartFile iconFile,
                       MultipartFile bannerFile);

    CategoryDto update(Long categoryId,
                       CategoryUpdateRequestDto request,
                       MultipartFile iconFile,
                       MultipartFile bannerFile);

    CategoryDto findCategoryById(Long categoryId);

    CategoryDto findCategoryBySlug(String categorySlug);

    Page<CategoryDto> findCategoriesPage(Pageable pageable);

    void deleteCategoryById(String publicId, Long categoryId);

    Page<CategoryDto> getUserOwnedCategories(String publicId, Pageable pageable);

    Boolean checkAccessToCategory(String publicId, String categorySlug);

    UserBanDataDto banUser(UserBanRequestDto request,  String moderatorPublicId, String targetUserPublicId, String categorySlug);

    void unbanUser(String publicId, String targetUserPublicId, String categorySlug);

    Page<UserBanDataResponseDto> findBannedUsers(Pageable pageable, String categorySlug, String username, Boolean isPermanentBan, LocalDateTime unbanTimeStart, LocalDateTime unbanTimeEnd);

    UserBanDataResponseDto updateBanData(UserBanRequestDto request, String publicId, String targetUserPublicId, String categorySlug);
}