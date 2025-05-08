package com.example.backend.services;

import com.example.backend.dto.CategoryModeratorDto;
import com.example.backend.dto.ModeratorRoleInfoDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;

public interface CategoryModeratorService {

    CategoryModeratorDto addModerator(String ownerPublicId, String newModPublicId, Long categoryId);

    void deleteModerator(String ownerPublicId, String moderatorPublicId, Long categoryId);

    Page<CategoryModeratorDto> getCategoryModerators(Long categoryId, Pageable pageable);

    List<CategoryModeratorDto> getModeratorByPublicId(String moderatorPublicId, Long categoryId);

    ModeratorRoleInfoDto getModeratorRoles(String moderatorPublicId, Long categoryId);

    List<CategoryModeratorDto> getModeratorByPublicId(String moderatorPublicId, String categorySlug);

    Set<String> findUserModeratedCategories(String publicId);
}