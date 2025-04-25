package com.example.backend.services;

import com.example.backend.dto.CategoryFollowDto;
import com.example.backend.dto.CategoryFollowUpdateRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryFollowService {

    CategoryFollowDto follow(String publicId, Long categoryId);

    void deleteFollow(String publicId, Long categoryId);

    Page<CategoryFollowDto> getCategoryFollowersPage(Long categoryId, Pageable pageable);

    Page<CategoryFollowDto> getUserFollows(String publicId, Pageable pageable);

    CategoryFollowDto updateFollow(String publicId, Long categoryId, CategoryFollowUpdateRequestDto request);

}