package com.example.backend.services;

import com.example.backend.dto.CategoryCreateRequestDto;
import com.example.backend.dto.CategoryDto;
import com.example.backend.dto.CategoryFollowDto;
import com.example.backend.dto.CategoryUpdateRequestDto;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

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
}