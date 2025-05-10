package com.example.backend.services.impls;

import com.amazonaws.services.dynamodbv2.xspec.S;
import com.example.backend.dto.PostCreateRequestDto;
import com.example.backend.dto.PostDto;
import com.example.backend.dto.PostUpdateRequestDto;
import com.example.backend.exceptions.CategoryNotFoundException;
import com.example.backend.exceptions.PostNotFoundException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.mappers.PostMapper;
import com.example.backend.models.*;
import com.example.backend.models.enums.PostPermission;
import com.example.backend.models.enums.PostType;
import com.example.backend.models.enums.Visibility;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.PostImageRepository;
import com.example.backend.repositories.PostRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.services.PostService;
import com.example.backend.services.S3Service;
import com.example.backend.utils.ImageUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final PostMapper postMapper;
    private final S3Service s3Service;
    private final PostImageRepository postImageRepository;

    @Override
    @Transactional
    public PostDto createPost(String creatorPublicId, PostCreateRequestDto request, List<MultipartFile> images) {
        final User user = findUserByPublicId(creatorPublicId);
        final Category category = findCategoryBySlug(request.getCategorySlug());

        verifyCategoryPostPermission(category, user);

        Post post = Post.builder()
                .title(request.getTitle())
                .body(request.getBody())
                .type(request.getType())
                .creator(user)
                .category(category)
                .commentsCount(0L)
                .build();

        if (images != null && !images.isEmpty()) {
            post.setPostImages(createAndUploadPostImages(images, post));
        }

        user.setPostsCount(user.getPostsCount() + 1);
        Post savedPost = postRepository.save(post);

        return postMapper.toDto(savedPost);
    }

    private void verifyCategoryPostPermission(Category category, User user) {
        final PostPermission permission = category.getPostPermission();
        boolean isCategoryMod = user.getModeratedCategories().stream()
                .anyMatch(mod -> mod.getCategory().equals(category));
        boolean isMember = user.getFollowedCategories().stream()
                .anyMatch(follow -> follow.getCategory().equals(category));

        if (permission == PostPermission.MODS_ONLY && !isCategoryMod) {
            throw new AccessDeniedException(STR."Post permission for category with slug=\{category.getSlug()} is \{permission}, but user does not have category moderator authority to perform such an action");
        } else if (permission == PostPermission.MEMBERS_ONLY && !isMember && !isCategoryMod) {
            throw new AccessDeniedException(STR."Post permission for category with slug=\{category.getSlug()} is \{permission}, but user has neither category moderator authority, nor member authority to perform such an action");
        }
    }

    @Override
    public PostDto findById(Long postId) {
        final Post post = findPostById(postId);
        if (!checkAccessToPost(post)) {
            throw new AccessDeniedException(STR."Such a user has no permission to view the post with id=\{postId}");
        }
        return postMapper.toDto(post);
    }

    @Override
    @Transactional
    public Page<PostDto> findPostsPage(Pageable pageable, PostType type, String creatorPublicId, String categorySlug) {
        User creator = creatorPublicId == null ? null : findUserByPublicId(creatorPublicId);
        Category category = categorySlug == null ? null : findCategoryBySlug(categorySlug);

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User caller = null;
        if (principal !=null && !(principal instanceof String)) {
            caller = findUserByPublicId(((CustomUserDetails) principal).getPublicId());
        }

        return postRepository.findFilteredPage(type, creator, category, caller, pageable)
                .map(postMapper::toDto);
    }

    @Override
    @Transactional
    public PostDto update(Long postId, String publicId, PostUpdateRequestDto request, List<MultipartFile> newImages, List<String> keepImageUrls) {
        Post post = findPostById(postId);
        User user = findUserByPublicId(publicId);

        checkAuthorizedUser(user, post);

        List<String> imageOrder = request.getImageOrder();

        if (imageOrder == null) {
            imageOrder = Collections.emptyList();
        }

        Map<String, PostImage> originalImagesByUrl = post.getPostImages().stream()
                .collect(Collectors.toMap(PostImage::getUrl, Function.identity()));

        Map<String, PostImage> newImagesByNames = new TreeMap<>();
        if (newImages != null && !newImages.isEmpty()) {
            for (MultipartFile image : newImages) {
                String imageName = image.getOriginalFilename();
                String imageUrl = s3Service.uploadPostImage(image);
                Integer[] imageDimensions = ImageUtils.getImageWidthAndHeight(image);

                PostImage postImage = PostImage.builder()
                        .post(post)
                        .url(imageUrl)
                        .width(imageDimensions[0])
                        .height(imageDimensions[1])
                        .build();
                newImagesByNames.put(imageName, postImage);
            }
        }

        List<PostImage> orderedPostImages = new ArrayList<>();

        List<PostImage> imagesToKeepInOrder = new ArrayList<>();

        for (int i = 0; i < imageOrder.size(); i++) {
            String identifier = imageOrder.get(i);
            if (originalImagesByUrl.containsKey(identifier)) {
                PostImage existingImage = originalImagesByUrl.get(identifier);
                existingImage.setOrder(i);
                orderedPostImages.add(existingImage);
                imagesToKeepInOrder.add(existingImage);
            } else if (newImagesByNames.containsKey(identifier)) {
                PostImage newImageEntity = newImagesByNames.get(identifier);
                newImageEntity.setOrder(i);
                orderedPostImages.add(newImageEntity);
            }
        }

        List<PostImage> imagesToBeDeleted = post.getPostImages().stream()
                .filter(originalImage -> !imagesToKeepInOrder.contains(originalImage))
                .collect(Collectors.toList());

        deleteImageFromStorage(imagesToBeDeleted);

        postImageRepository.deleteAll(imagesToBeDeleted);

        post.setPostImages(orderedPostImages);

        post.setTitle(request.getTitle());
        post.setBody(request.getBody());
        post.setType(request.getType());

        Post updatedPost = postRepository.save(post);

        return postMapper.toDto(updatedPost);
    }

    @Override
    public void deleteById(String publicId, Long postId) {
        Post post = findPostById(postId);
        User user = findUserByPublicId(publicId);

        checkAuthorizedUser(user, post);

        user.setPostsCount(user.getPostsCount() - 1);
        postRepository.delete(post);
    }

    @Override
    public Page<PostDto> getPostsByUserFollowedCategories(String publicId, Pageable pageable) {
        User user = findUserByPublicId(publicId);

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User caller = null;
        if (principal !=null && !(principal instanceof String)) {
            caller = findUserByPublicId(((CustomUserDetails) principal).getPublicId());
        }

        Page<Post> postsFromFollowing = postRepository.findPostsFromUserFollowing(user, caller, pageable);

        return postsFromFollowing.map(postMapper::toDto);
    }

    private void deleteImageFromStorage(List<PostImage> imagesToBeDeleted) {
        if (!imagesToBeDeleted.isEmpty()) {
            for (PostImage image : imagesToBeDeleted) {
                s3Service.deletePostImage(image.getUrl());
            }
        }
    }

    private void checkAuthorizedUser(User user, Post post) {
        boolean isGlobalModeartor = user.getRoles().stream()
                .anyMatch(role -> role.getName() == Role.RoleName.ROLE_MODERATOR);

        boolean isPostCreator = post.getCreator().equals(user);

        boolean isCategoryModerator = user.getModeratedCategories().stream()
                .anyMatch(categoryModerator -> categoryModerator.getCategory().equals(post.getCategory()));

        if (!isPostCreator && !isGlobalModeartor && !isCategoryModerator) {
            new AccessDeniedException(STR."User with such publicId=\{user.getPublicId()} has no access to current post with id=\{post.getId()}");
        }
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

    private List<PostImage> createAndUploadPostImages(List<MultipartFile> images, Post post) {
        if (images.isEmpty()) return List.of();
        List<PostImage> postImages = new ArrayList<>();
        for (int i = 0; i < images.size(); i++) {
            MultipartFile image = images.get(i);
            Integer[] dimensions = ImageUtils.getImageWidthAndHeight(image);
            String url = s3Service.uploadPostImage(image);
            PostImage postImage = PostImage.builder()
                    .url(url)
                    .width(dimensions[0])
                    .height(dimensions[1])
                    .post(post)
                    .order(i)
                    .build();
            postImages.add(postImage);
        }
        return postImages;
    }

    private Boolean checkAccessToPost(Post post) {
        Category category = post.getCategory();
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal != null & !(principal instanceof String)) {
            String publicId = ((CustomUserDetails)principal).getPublicId();
            User user = findUserByPublicId(publicId);
            switch (category.getVisibility()) {
                case Visibility.PUBLIC:
                    return true;
                case Visibility.RESTRICTED:
                    return category.getCategoryModerators().stream().anyMatch(mod -> mod.getUser().equals(user));
                case Visibility.PRIVATE:
                    return category.getCreatedBy().equals(user);
            }
        }
        return category.getVisibility() == Visibility.PUBLIC;
    }
}