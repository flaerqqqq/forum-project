package com.example.backend.services;

import com.example.backend.dto.CategoryModeratorDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryModeratorService {

    CategoryModeratorDto addModerator(String ownerPublicId, String newModPublicId, Long categoryId);

    void deleteModerator(String ownerPublicId, String moderatorPublicId, Long categoryId);

    Page<CategoryModeratorDto> getCategoryModerators(Long categoryId, Pageable pageable);
}