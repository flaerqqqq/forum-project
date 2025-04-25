package com.example.backend.services.impls;

import com.example.backend.dto.CategoryFollowDto;
import com.example.backend.dto.CategoryFollowUpdateRequestDto;
import com.example.backend.exceptions.*;
import com.example.backend.mappers.CategoryFollowMapper;
import com.example.backend.models.Category;
import com.example.backend.models.CategoryFollow;
import com.example.backend.models.User;
import com.example.backend.repositories.CategoryFollowRepository;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.CategoryFollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryFollowServiceImpl implements CategoryFollowService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryFollowMapper categoryFollowMapper;
    private final CategoryFollowRepository categoryFollowRepository;

    @Override
    @Transactional
    public CategoryFollowDto follow(String publicId, Long categoryId) {
        User user = userRepository.findByPublicId(publicId).orElseThrow(() ->
                new UserNotFoundException("User with such a publicId=%s not found".formatted(publicId)));

        Category category = categoryRepository.findById(categoryId).orElseThrow(() ->
                new CategoryNotFoundException("Category with such a id=%d not found".formatted(categoryId)));

        if (categoryFollowRepository.existsByUserAndCategory(user, category)) {
            throw new UserAlreadyFollowsCategoryException("User with publicId=%s already follows a category with id=%d ".formatted(publicId, categoryId));
        }

        CategoryFollow categoryFollow = CategoryFollow.builder()
                .user(user)
                .category(category)
                .notificationEnabled(true)
                .build();
        category.setFollowersCount(category.getFollowersCount() + 1L);
        CategoryFollow savedCategoryFollow = categoryFollowRepository.save(categoryFollow);

        return categoryFollowMapper.toDto(savedCategoryFollow);
    }

    @Override
    @Transactional
    public void deleteFollow(String publicId, Long categoryId, Long followId) {
        final CategoryFollow categoryFollow = getAndValidateCategoryFollow(publicId, categoryId, followId);
        Category category = categoryFollow.getCategory();
        category.setFollowersCount(category.getFollowersCount() - 1);

        categoryFollowRepository.delete(categoryFollow);
    }

    @Override
    public Page<CategoryFollowDto> getCategoryFollowersPage(Long categoryId, Pageable pageable) {
        Category category = categoryRepository.findById(categoryId).orElseThrow(() ->
                new CategoryNotFoundException("Category with such a id=%d not found".formatted(categoryId)));
        return categoryFollowRepository.findAllByCategory(category, pageable).map(categoryFollowMapper::toDto);
    }

    @Override
    public Page<CategoryFollowDto> getUserFollows(String publicId, Pageable pageable) {
        User user = userRepository.findByPublicId(publicId).orElseThrow(() ->
                new UserNotFoundException("User with such a publicId=%s not found".formatted(publicId)));
        return categoryFollowRepository.findAllByUser(user, pageable).map(categoryFollowMapper::toDto);
    }

    @Override
    public CategoryFollowDto updateFollow(String publicId, Long categoryId, Long followId, CategoryFollowUpdateRequestDto request) {
        final CategoryFollow categoryFollow = getAndValidateCategoryFollow(publicId, categoryId, followId);

        categoryFollow.setNotificationEnabled(request.getNotificationEnabled());
        CategoryFollow savedCategoryFollow = categoryFollowRepository.save(categoryFollow);

        return categoryFollowMapper.toDto(savedCategoryFollow);
    }

    private CategoryFollow getAndValidateCategoryFollow(String publicId, Long categoryId, Long followId) {
        User user = userRepository.findByPublicId(publicId).orElseThrow(() ->
                new UserNotFoundException("User with such a publicId=%s not found".formatted(publicId)));

        Category category = categoryRepository.findById(categoryId).orElseThrow(() ->
                new CategoryNotFoundException("Category with such a id=%d not found".formatted(categoryId)));

        CategoryFollow categoryFollow = categoryFollowRepository.findById(followId).orElseThrow(() ->
                new CategoryFollowNotFoundException("Category follow with id=%d not found".formatted(followId)));

        if (!categoryFollow.getUser().equals(user) || !categoryFollow.getCategory().equals(category)) {
            throw new UserNotFollowCategoryException("User with publicId=%s do not follow category with id=%d".formatted(publicId, categoryId));
        }

        return categoryFollow;
    }
}