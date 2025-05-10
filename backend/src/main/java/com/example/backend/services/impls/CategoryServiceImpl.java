package com.example.backend.services.impls;

import com.example.backend.dto.CategoryCreateRequestDto;
import com.example.backend.dto.CategoryDto;
import com.example.backend.dto.CategoryUpdateRequestDto;
import com.example.backend.exceptions.CategoryAlreadyExistsException;
import com.example.backend.exceptions.CategoryNotFoundException;
import com.example.backend.exceptions.UserNotCategoryOwnerException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.mappers.CategoryMapper;
import com.example.backend.models.*;
import com.example.backend.models.enums.CategoryModeratorRole;
import com.example.backend.models.enums.Visibility;
import com.example.backend.repositories.CategoryModeratorRepository;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.CategoryService;
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
public class CategoryServiceImpl implements CategoryService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryModeratorRepository categoryModeratorRepository;
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

        CategoryModerator categoryOwner = CategoryModerator.builder()
                .user(creator)
                .category(category)
                .role(CategoryModeratorRole.OWNER)
                .build();

        CategoryModerator categoryModerator = CategoryModerator.builder()
                .user(creator)
                .category(category)
                .role(CategoryModeratorRole.MODERATOR)
                .build();

        CategoryFollow categoryFollow = CategoryFollow.builder()
                .user(creator)
                .category(category)
                .notificationEnabled(true)
                .build();

        category.setCategoryModerators(List.of(categoryOwner, categoryModerator));
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

        category.setName(request.getName());
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
        Category category = categoryRepository.findById(categoryId).orElseThrow(() ->
                new CategoryNotFoundException("Category with a such id=%s not found".formatted(categoryId)));

        return categoryMapper.toDto(category);
    }

    @Override
    public CategoryDto findCategoryBySlug(String categorySlug) {
        Category category = categoryRepository.findBySlug(categorySlug).orElseThrow(() ->
                new CategoryNotFoundException("Category with a such slug=%s not found".formatted(categorySlug)));

        return categoryMapper.toDto(category);
    }

    @Override
    public Page<CategoryDto> findCategoriesPage(Pageable pageable) {
        return categoryRepository.findAll(pageable)
                .map(categoryMapper::toDto);
    }

    @Override
    @Transactional
    public void deleteCategoryById(String publicId, Long categoryId) {
        User user = userRepository.findByPublicId(publicId).orElseThrow(() ->
                new UserNotFoundException("User with such a publicId=%s not found".formatted(publicId)));

        Category category = categoryRepository.findById(categoryId).orElseThrow(() ->
                new CategoryNotFoundException("Category with such a id=%d not found".formatted(categoryId)));

        if (!isUserAuthorizedToDelete(user, category)) {
            throw new UserNotCategoryOwnerException("User with publicId=%s is not an owner of category with id=%d".formatted(publicId, categoryId));
        }

        categoryRepository.delete(category);
    }

    @Override
    public Page<CategoryDto> getUserOwnedCategories(String publicId, Pageable pageable) {
        User user = userRepository.findByPublicId(publicId).orElseThrow(() ->
                new UserNotFoundException("User with such a publicId=%s not found".formatted(publicId)));

        return categoryRepository.findAllByCreatedBy(user, pageable).map(categoryMapper::toDto);
    }

    @Override
    public Boolean checkAccessToCategory(String publicId, String categorySlug) {
        Category category = categoryRepository.findBySlug(categorySlug).orElseThrow(() ->
                new CategoryNotFoundException("Category with such a id=%d not found".formatted(categorySlug)));

        if (publicId != null) {
            User user = userRepository.findByPublicId(publicId).orElseThrow(() ->
                    new UserNotFoundException("User with such a publicId=%s not found".formatted(publicId)));
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

    private boolean isUserAuthorizedToDelete(User user, Category category) {
        if (user.getRoles().stream().anyMatch(role -> role.getName().equals(Role.RoleName.ROLE_MODERATOR))) {
            return true;
        }

        return categoryModeratorRepository.isCategoryOwner(user, category);
    }
}