package com.example.backend.services;

import com.example.backend.dto.CategoryCreateRequestDto;
import com.example.backend.dto.CategoryDto;
import org.springframework.web.multipart.MultipartFile;

public interface CategoryService {

    CategoryDto create(String creatorPublicId,
                       CategoryCreateRequestDto request,
                       MultipartFile iconFile,
                       MultipartFile bannerFile);
}