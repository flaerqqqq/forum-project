package com.example.backend.services.impls;

import com.example.backend.dto.CategoryModeratorDto;
import com.example.backend.dto.ModeratorRoleInfoDto;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
    public void deleteModerator(String publicId, String moderatorPublicId, Long categoryId) {
        User owner = userRepository.findByPublicId(publicId).orElseThrow(() ->
                new UserNotFoundException("User with such a publicId=%s not found".formatted(publicId)));

        User moderator = userRepository.findByPublicId(moderatorPublicId).orElseThrow(() ->
                new UserNotFoundException("User with such a publicId=%s not found".formatted(moderatorPublicId)));

        Category category = categoryRepository.findById(categoryId).orElseThrow(() ->
                new CategoryNotFoundException("Category with such a id=%d not found".formatted(categoryId)));

        if (!categoryModeratorRepository.isCategoryOwner(owner, category)) {
            throw new UserNotCategoryOwnerException("User with a publicId=%s not an owner of category with id=%d".formatted(publicId, categoryId));
        }

        if (publicId.equals(moderatorPublicId)) {
            throw new CannotRemoveYourselfAsOwnerException("User with publicId=%s try to delete moderator roles from himself, but cannot remove yourself as the owner.");
        }

        if (!categoryModeratorRepository.isCategoryModerator(moderator, category) ) {
            throw new UserNotCategoryModeratorException("User with a publicId=%s not a moderator of category with an id=%d".formatted(moderatorPublicId, categoryId));
        }

        categoryModeratorRepository.deleteByUserAndCategory(moderator, category);
    }

    @Override
    public Page<CategoryModeratorDto> getCategoryModerators(Long categoryId, Pageable pageable) {
        Category category = categoryRepository.findById(categoryId).orElseThrow(() ->
                new CategoryNotFoundException("Category with such a id=%d not found".formatted(categoryId)));

        return categoryModeratorRepository.findAllByCategory(category, pageable).map(categoryModeratorMapper::toDto);
    }

    @Override
    public List<CategoryModeratorDto> getModeratorByPublicId(String moderatorPublicId, Long categoryId) {
        User moderator = userRepository.findByPublicId(moderatorPublicId).orElseThrow(() ->
                new UserNotFoundException("User with such a publicId=%s not found".formatted(moderatorPublicId)));

        Category category = categoryRepository.findById(categoryId).orElseThrow(() ->
                new CategoryNotFoundException("Category with such a id=%d not found".formatted(categoryId)));

        List<CategoryModerator> categoryModeratorsByUser = categoryModeratorRepository.findAllByUserAndCategory(moderator, category);

        if (categoryModeratorsByUser.isEmpty()) {
            throw new UserNotCategoryModeratorException("User with a publicId=%s not a moderator of category with an id=%d".formatted(moderatorPublicId, categoryId));
        }

        return categoryModeratorsByUser.stream().map(categoryModeratorMapper::toDto).toList();
    }

    @Override
    public ModeratorRoleInfoDto getModeratorRoles(String moderatorPublicId, Long categoryId) {
        List<CategoryModeratorDto> categoryModeratorRoles = getModeratorByPublicId(moderatorPublicId, categoryId);

        return ModeratorRoleInfoDto.builder()
                .roles(categoryModeratorRoles.stream().map(CategoryModeratorDto::getRole).toList())
                .build();
    }
}