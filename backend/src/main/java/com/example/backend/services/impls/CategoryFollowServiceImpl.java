package com.example.backend.services.impls;

import com.example.backend.dto.CategoryFollowDto;
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
            throw new UserAlreadyFollowsCategoryException("User with publicId=%s already follows a category with slug=%s ".formatted(publicId, categorySlug));
        }

        CategoryFollow categoryFollow = CategoryFollow.builder()
                .user(user)
                .category(category)
                .notificationEnabled(true)
                .build();
        CategoryFollow savedCategoryFollow = categoryFollowRepository.save(categoryFollow);

        return categoryFollowMapper.toDto(savedCategoryFollow);
    }

    @Override
    @Transactional
    public void deleteFollow(String publicId, Long categoryId, Long followId) {
        User user = userRepository.findByPublicId(publicId).orElseThrow(() ->
                new UserNotFoundException("User with such a publicId=%s not found".formatted(publicId)));

        Category category = categoryRepository.findById(categoryId).orElseThrow(() ->
                new CategoryNotFoundException("Category with such a id=%d not found".formatted(categoryId)));

        CategoryFollow categoryFollow = categoryFollowRepository.findById(followId).orElseThrow(() ->
                new CategoryFollowNotFoundException("Category follow with id=%d not found".formatted(followId)));

        if (!categoryFollow.getUser().equals(user) || !categoryFollow.getCategory().equals(category)) {
            throw new UserNotFollowCategoryException("User with publicId=%s do not follow category with id=%d".formatted(publicId, categoryId));
        }

        categoryFollowRepository.delete(categoryFollow);
    }
}