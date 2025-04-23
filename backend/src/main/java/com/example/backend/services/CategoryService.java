package com.example.backend.services;

import com.example.backend.dto.CategoryCreateRequestDto;
import com.example.backend.dto.CategoryDto;
import com.example.backend.dto.CategoryUpdateRequestDto;
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
}