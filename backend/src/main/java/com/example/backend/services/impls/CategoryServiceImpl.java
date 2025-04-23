package com.example.backend.services.impls;

import com.example.backend.dto.CategoryCreateRequestDto;
import com.example.backend.dto.CategoryDto;
import com.example.backend.dto.CategoryUpdateRequestDto;
import com.example.backend.exceptions.CategoryAlreadyExistsException;
import com.example.backend.exceptions.CategoryNotFoundException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.mappers.CategoryMapper;
import com.example.backend.models.Category;
import com.example.backend.models.CategoryFollow;
import com.example.backend.models.CategoryModerator;
import com.example.backend.models.User;
import com.example.backend.models.enums.CategoryModeratorRole;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.CategoryService;
import com.example.backend.services.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final S3Service s3Service;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public CategoryDto create(String creatorPublicId,
                              CategoryCreateRequestDto request,
                              MultipartFile iconFile,
                              MultipartFile bannerFile) {
        User creator = userRepository.findByPublicId(creatorPublicId).orElseThrow(() -> new UserNotFoundException());

        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new CategoryAlreadyExistsException();
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .visibility(request.getVisibility())
                .postPermission(request.getPostPermission())
                .createdBy(creator)
                .build();

        CategoryModerator categoryModerator = CategoryModerator.builder()
                .user(creator)
                .category(category)
                .role(CategoryModeratorRole.OWNER)
                .build();

        CategoryFollow categoryFollow = CategoryFollow.builder()
                .user(creator)
                .category(category)
                .notificationEnabled(true)
                .build();

        category.setCategoryModerators(List.of(categoryModerator));
        category.setFollowers(List.of(categoryFollow));
        category.setFollowersCount(1L);

        if (iconFile != null) {
            category.setIconUrl(s3Service.uploadCategoryIcon(iconFile));
        }

        if (bannerFile != null) {
            category.setBannerUrl(s3Service.uploadCategoryBanner(bannerFile));
        }

        Category savedCategory = categoryRepository.save(category);

        return categoryMapper.toDto(savedCategory);
    }

    @Override
    public CategoryDto update(Long categoryId,
                              CategoryUpdateRequestDto request,
                              MultipartFile iconFile,
                              MultipartFile bannerFile) {
        Category category = categoryRepository.findById(categoryId).orElseThrow(() -> new CategoryNotFoundException());

        if (!category.getSlug().equals(request.getSlug()) && categoryRepository.existsBySlug(request.getSlug())) {
            throw new CategoryAlreadyExistsException("Category with such a slug=%s already exists".formatted(
                    request.getSlug()));
        }

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setVisibility(request.getVisibility());
        category.setPostPermission(request.getPostPermission());

        if (iconFile != null) {
            String oldIconUrl = category.getIconUrl();
            category.setIconUrl(s3Service.uploadCategoryIcon(iconFile));
            if (oldIconUrl != null) s3Service.deleteCategoryIcon(oldIconUrl);
        }

        if (bannerFile != null) {
            String oldBannerUrl = category.getBannerUrl();
            category.setBannerUrl(s3Service.uploadCategoryBanner(bannerFile));
            if(oldBannerUrl != null) s3Service.deleteCategoryBanner(oldBannerUrl);
        }

        Category savedCategory = categoryRepository.save(category);

        return categoryMapper.toDto(savedCategory);
    }

    @Override
    public CategoryDto findCategoryById(Long categoryId) {
        Category category = categoryRepository.findById()
    }
}