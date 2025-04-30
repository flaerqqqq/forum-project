package com.example.backend.controllers;

import com.example.backend.dto.PostCreateRequestDto;
import com.example.backend.dto.PostDto;
import com.example.backend.dto.PostResponseDto;
import com.example.backend.mappers.PostMapper;
import com.example.backend.models.enums.PostType;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.services.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostMapper postMapper;
    private final PostService postService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<PostResponseDto> create(@RequestPart("data") PostCreateRequestDto request,
                                                  @RequestParam(name = "images", required = false) List<MultipartFile> images,
                                                  @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        PostDto postDto = postService.createPost(customUserDetails.getPublicId(), request, images);
        URI resourceUri = URI.create(STR."/api/v1/posts/\{postDto.getId()}");
        return ResponseEntity.created(resourceUri).body(postMapper.toResponseDto(postDto));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponseDto> getPostById(@PathVariable Long postId) {
        PostDto postDto = postService.findById(postId);
        return ResponseEntity.ok(postMapper.toResponseDto(postDto));
    }

    @GetMapping
    public ResponseEntity<Page<PostResponseDto>> getPostsPage(Pageable pageable,
                                                              @RequestParam(value = "type", required = false) PostType type,
                                                              @RequestParam(value = "creatorPublicId", required = false) String creatorPublicId,
                                                              @RequestParam(value = "categorySlug", required = false) String categorySlug) {
        Page<PostResponseDto> postsPage = postService.findPostsPage(pageable, type, creatorPublicId, categorySlug).map(postMapper::toResponseDto);
        if (postsPage.isEmpty()) {
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(postsPage);
    }
}