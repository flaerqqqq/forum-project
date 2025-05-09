package com.example.backend.services;

import com.example.backend.dto.CategoryDto;

import java.util.List;

public interface CategorySearchService {

    List<CategoryDto> searchCategoriesBySlugOrName(String rawQuery, String creatorPublicId);
}