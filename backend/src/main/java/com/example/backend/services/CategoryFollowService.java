package com.example.backend.services;

import com.example.backend.dto.CategoryFollowDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryFollowService {

    CategoryFollowDto follow(String publicId, Long categoryId);

    void deleteFollow(String publicId, Long categoryId, Long followId);

    Page<CategoryFollowDto> getCategoryFollowersPage(Long categoryId, Pageable pageable);

    Page<CategoryFollowDto> getUserFollows(String publicId, Pageable pageable);
}