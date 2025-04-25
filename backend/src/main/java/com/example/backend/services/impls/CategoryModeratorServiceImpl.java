package com.example.backend.services.impls;

import com.example.backend.dto.CategoryModeratorDto;
import com.example.backend.exceptions.*;
import com.example.backend.mappers.CategoryModeratorMapper;
import com.example.backend.models.Category;
import com.example.backend.models.CategoryModerator;
import com.example.backend.models.User;
import com.example.backend.models.enums.CategoryModeratorRole;
import com.example.backend.repositories.CategoryModeratorRepository;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.CategoryModeratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryModeratorServiceImpl implements CategoryModeratorService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryModeratorMapper categoryModeratorMapper;
    private final CategoryModeratorRepository categoryModeratorRepository;

    @Override
    @Transactional
    public CategoryModeratorDto addModerator(String ownerPublicId, String newModPublicId, Long categoryId) {
        User owner = userRepository.findByPublicId(ownerPublicId).orElseThrow(() ->
                new UserNotFoundException("User with such a publicId=%s not found".formatted(ownerPublicId)));
        User newMod = userRepository.findByPublicId(newModPublicId).orElseThrow(() ->
                new UserNotFoundException("User with such a publicId=%s not found".formatted(newModPublicId)));
        Category category = categoryRepository.findById(categoryId).orElseThrow(() ->
                new CategoryNotFoundException("Category with such a id=%d not found".formatted(categoryId)));

        if (!categoryModeratorRepository.isCategoryOwner(owner, category)) {
            throw new UserNotCategoryOwnerException("User with a publicId=%s not an owner of category with id=%d".formatted(ownerPublicId, categoryId));
        }
        if (categoryModeratorRepository.isCategoryModerator(newMod, category) ) {
            throw new UserAlreadyCategoryModeratorException("User with a publicId=%s already a moderator of category with an id=%d".formatted(newModPublicId, categoryId));
        }

        CategoryModerator categoryModerator = CategoryModerator.builder()
                .user(newMod)
                .category(category)
                .role(CategoryModeratorRole.MODERATOR)
                .build();
        CategoryModerator savedCategoryModerator = categoryModeratorRepository.save(categoryModerator);

        return categoryModeratorMapper.toDto(savedCategoryModerator);
    }

    @Override
    @Transactional
    public void deleteModerator(String ownerPublicId, String moderatorPublicId, Long categoryId) {
        User owner = userRepository.findByPublicId(ownerPublicId).orElseThrow(() ->
                new UserNotFoundException("User with such a publicId=%s not found".formatted(ownerPublicId)));
        User moderator = userRepository.findByPublicId(moderatorPublicId).orElseThrow(() ->
                new UserNotFoundException("User with such a publicId=%s not found".formatted(moderatorPublicId)));
        Category category = categoryRepository.findById(categoryId).orElseThrow(() ->
                new CategoryNotFoundException("Category with such a id=%d not found".formatted(categoryId)));

        if (!categoryModeratorRepository.isCategoryOwner(owner, category)) {
            throw new UserNotCategoryOwnerException("User with a publicId=%s not an owner of category with id=%d".formatted(ownerPublicId, categoryId));
        }
        if (!categoryModeratorRepository.isCategoryModerator(moderator, category) ) {
            throw new UserNotCategoryModeratorException("User with a publicId=%s not a moderator of category with an id=%d".formatted(moderatorPublicId, categoryId));
        }

        categoryModeratorRepository.deleteByUserAndCategory(moderator, category);
    }
}