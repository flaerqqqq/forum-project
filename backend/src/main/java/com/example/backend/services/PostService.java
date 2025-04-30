package com.example.backend.services;

import com.example.backend.dto.PostCreateRequestDto;
import com.example.backend.dto.PostDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PostService {

    PostDto createPost(String creatorPublicId, PostCreateRequestDto request, List<MultipartFile> images);

    PostDto findById(Long postId);
}