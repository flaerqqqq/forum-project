package com.example.backend.services;

import com.example.backend.dto.CategoryFollowDto;

public interface CategoryFollowService {

    CategoryFollowDto follow(String publicId, String categorySlug);

    void deleteFollow(String publicId, String categorySlug, Long followId);
}