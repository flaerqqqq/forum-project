package com.example.backend.services.impls;

import com.example.backend.dto.PostCreateRequestDto;
import com.example.backend.dto.PostDto;
import com.example.backend.dto.PostUpdateRequestDto;
import com.example.backend.exceptions.CategoryNotFoundException;
import com.example.backend.exceptions.PostNotFoundException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.mappers.PostMapper;
import com.example.backend.models.Category;
import com.example.backend.models.Post;
import com.example.backend.models.PostImage;
import com.example.backend.models.User;
import com.example.backend.models.enums.PostType;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.PostRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.PostService;
import com.example.backend.services.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final PostMapper postMapper;
    private final S3Service s3Service;

    @Override
    @Transactional
    public PostDto createPost(String creatorPublicId, PostCreateRequestDto request, List<MultipartFile> images) {
        final User user = findUserByPublicId(creatorPublicId);
        final Category category = findCategoryBySlug(request.getCategorySlug());

        Post post = Post.builder()
                .title(request.getTitle())
                .body(request.getBody())
                .type(request.getType())
                .creator(user)
                .category(category)
                .commentsCount(0L)
                .build();

        if (images != null && !images.isEmpty()) {
            post.setPostImages(createAndUploadPostImages(images));
        }

        Post savedPost = postRepository.save(post);

        return postMapper.toDto(savedPost);
    }

    @Override
    public PostDto findById(Long postId) {
        final Post post = findPostById(postId);
        return postMapper.toDto(post);
    }

    @Override
    @Transactional
    public Page<PostDto> findPostsPage(Pageable pageable, PostType type, String creatorPublicId, String categorySlug) {
        User creator = creatorPublicId == null ? null : findUserByPublicId(creatorPublicId);
        Category category = categorySlug == null ? null : findCategoryBySlug(categorySlug);
        return postRepository.findFilteredPage(type, creator, category, pageable).map(postMapper::toDto);
    }

    @Override
    public PostDto update(Long postId, String publicId, PostUpdateRequestDto request, List<MultipartFile> newImages, List<String> keepImageUrls) {
        return null;
    }

    private Post findPostById(Long postId) {
        return postRepository.findById(postId).orElseThrow(() ->
                new PostNotFoundException(STR."Post with such id=\{postId} not found"));
    }

    private Category findCategoryBySlug(String categorySlug) {
        return categoryRepository.findBySlug(categorySlug).orElseThrow(() ->
                new CategoryNotFoundException(STR."Category with such slug=\{categorySlug} not found"));
    }

    private User findUserByPublicId(String creatorPublicId) {
        return userRepository.findByPublicId(creatorPublicId).orElseThrow(() ->
                new UserNotFoundException(STR."User with such publicId=\{creatorPublicId} not found"));
    }

    private List<PostImage> createAndUploadPostImages(List<MultipartFile> images) {
        if (images.isEmpty()) return List.of();
        return images.stream()
                .map(image -> PostImage.builder().url(s3Service.uploadPostImage(image)).build())
                .toList();

    }
}