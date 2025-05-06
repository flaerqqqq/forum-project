package com.example.backend.services;

import com.example.backend.dto.PostDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostSearchService {

    Page<PostDto> searchPosts(String rawQuery, Pageable pageable);
}