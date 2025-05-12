package com.example.backend.services;

import com.example.backend.dto.PostCreateRequestDto;
import com.example.backend.dto.PostDto;
import com.example.backend.dto.PostUpdateRequestDto;
import com.example.backend.models.Post;
import com.example.backend.models.enums.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PostService {

    PostDto createPost(String creatorPublicId, PostCreateRequestDto request, List<MultipartFile> images);

    PostDto findById(Long postId);

    Page<PostDto> findPostsPage(Pageable pageable, PostType type, String creatorPublicId, String categorySlug);

    PostDto update(Long postId, String publicId, PostUpdateRequestDto request, List<MultipartFile> newImages, List<String> keepImageUrls);

    void deleteById(String publicId, Long postId);

    Page<PostDto> getPostsByUserFollowedCategories(String publicId, Pageable pageable);

    Boolean checkAccessToPost(Post post);
}