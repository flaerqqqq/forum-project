package com.example.backend.services;

import com.example.backend.dto.CategoryFollowDto;

public interface CategoryFollowService {

    CategoryFollowDto follow(String publicId, Long categoryId);

    void deleteFollow(String publicId, Long categoryId, Long followId);
}