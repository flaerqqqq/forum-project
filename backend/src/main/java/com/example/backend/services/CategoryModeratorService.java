package com.example.backend.services;

import com.example.backend.dto.CategoryModeratorDto;

public interface CategoryModeratorService {

    CategoryModeratorDto addModerator(String ownerPublicId, String newModPublicId, Long categoryId);

    void deleteModerator(String ownerPublicId, String moderatorPublicId, Long categoryId);
}