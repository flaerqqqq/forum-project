package com.example.backend.services.impls;

import com.example.backend.dto.PostCreateRequestDto;
import com.example.backend.dto.PostDto;
import com.example.backend.exceptions.CategoryNotFoundException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.mappers.PostMapper;
import com.example.backend.models.Category;
import com.example.backend.models.Post;
import com.example.backend.models.PostImage;
import com.example.backend.models.User;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.PostRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.PostService;
import com.example.backend.services.S3Service;
import lombok.RequiredArgsConstructor;
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
        final Category category = findCategoryBySlug(request);

        Post post = Post.builder()
                .title(request.getTitle())
                .body(request.getBody())
                .type(request.getType())
                .creator(user)
                .category(category)
                .build();

        if (images != null && !images.isEmpty()) {
            post.setPostImages(createAndUploadPostImages(images));
        }

        Post savedPost = postRepository.save(post);

        return postMapper.toDto(savedPost);
    }

    private Category findCategoryBySlug(PostCreateRequestDto request) {
        Category category = categoryRepository.findBySlug(request.getCategorySlug()).orElseThrow(() ->
                new CategoryNotFoundException(STR."Category with such slug=\{request.getCategorySlug()} not found"));
        return category;
    }

    private User findUserByPublicId(String creatorPublicId) {
        User user = userRepository.findByPublicId(creatorPublicId).orElseThrow(() ->
                new UserNotFoundException(STR."User with such publicId=\{creatorPublicId} not found"));
        return user;
    }

    private List<PostImage> createAndUploadPostImages(List<MultipartFile> images) {
        if (images.isEmpty()) return List.of();
        return images.stream()
                .map(image -> PostImage.builder().url(s3Service.uploadPostImage(image)).build())
                .toList();

    }
}