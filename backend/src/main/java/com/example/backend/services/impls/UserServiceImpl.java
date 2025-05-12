package com.example.backend.services.impls;

import com.example.backend.dto.*;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.mappers.UserBanDataMapper;
import com.example.backend.mappers.UserMapper;
import com.example.backend.models.Avatar;
import com.example.backend.models.Category;
import com.example.backend.models.User;
import com.example.backend.models.UserBanData;
import com.example.backend.repositories.UserBanDataRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.S3Service;
import com.example.backend.services.UserService;
import com.example.backend.utils.ImageValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final S3Service s3Service;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final ImageValidator imageValidator;
    private final UserBanDataRepository userBanDataRepository;
    private final UserBanDataMapper userBanDataMapper;

    @Override
    public UserDto findByPublicId(String publicId) {
        User user = getByPublicId(publicId);
        return userMapper.toDto(user);
    }

    @Override
    public UserDto findByUsername(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() ->
                new UserNotFoundException("User with such username=%s not found".formatted(username)));
        return userMapper.toDto(user);
    }

    @Override
    public UserDto updateUser(String publicId, UpdateUserProfileDto updateDto) {
        User user = getByPublicId(publicId);

        if (updateDto.getDisplayName() != null) {
            user.setDisplayName(updateDto.getDisplayName());
        }

        if (updateDto.getDescription() != null) {
            user.setDescription(updateDto.getDescription());
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toDto(updatedUser);
    }

    @Override
    public void deleteUser(String publicId) {
        User user = userRepository.findByPublicId(publicId).orElseThrow(() ->
                new UserNotFoundException());

        for (Category category : user.getCreatedCategories()) {
            category.setCreatedBy(null);
            userRepository.save(user);
        }

        userRepository.deleteByPublicId(publicId);
    }

    @Override
    @Transactional
    public String addAvatar(String publicId, MultipartFile file) {
        User user = getByPublicId(publicId);

        String newAvatarUrl = s3Service.uploadAvatar(file);

        if (user.getAvatar() != null) {
            s3Service.deleteAvatar(user.getAvatar().getUrl());
            user.getAvatar().setUrl(newAvatarUrl);
        } else {
            Avatar avatar = Avatar.builder()
                    .url(newAvatarUrl)
                    .user(user)
                    .build();
            user.setAvatar(avatar);
        }

        userRepository.save(user);
        return newAvatarUrl;
    }

    private User getByPublicId(String publicId) {
        return userRepository.findByPublicId(publicId).orElseThrow(() ->
                new UserNotFoundException("User with such publicId=%s not found".formatted(publicId)));
    }

    private User getByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(() ->
                new UserNotFoundException("User with such username=%s not found".formatted(username)));
    }

    @Override
    @Transactional
    public UserBanDataResponseDto ban(UserBanRequestDto request, String moderatorPublicId, String targetPublicId) {
        if (!request.getIsPermanentBan() && request.getUnbanAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Specified unbanAt time is before current time");
        }

        User moderator = getByPublicId(moderatorPublicId);
        User targetUser = getByPublicId(targetPublicId);

        if (targetUser.getUserBanData() != null && targetUser.getUserBanData().stream().anyMatch(banData ->
                !banData.getIsCategoryBan())) {
            throw new RuntimeException(STR."User with publicId=\{targetPublicId} already has a ban");
        }

        UserBanData userBanData = UserBanData.builder()
                .bannedAt(LocalDateTime.now())
                .isCategoryBan(false)
                .isPermanentBan(request.getIsPermanentBan())
                .unbanAt(request.getUnbanAt())
                .reason(request.getReason())
                .bannedUser(targetUser)
                .moderator(moderator)
                .build();

        UserBanData savedData = userBanDataRepository.save(userBanData);

        return userBanDataMapper.toResponseDto(savedData);
    }

    @Override
    @Transactional
    public void unban(String targetPublicId) {
        User user = getByPublicId(targetPublicId);

        UserBanData userBanData = user.getUserBanData().stream()
                .filter(banData -> !banData.getIsCategoryBan())
                .findAny().orElseThrow(() ->
                        new RuntimeException("Tried to unban a user without a ban"));

        user.setUserBanData(user.getUserBanData().stream()
                .filter(banData -> !banData.equals(userBanData))
                .toList());
        userBanData.setBannedUser(null);

        userBanDataRepository.delete(userBanData);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public Page<UserBanDataResponseDto> findBannedUsers(Pageable pageable, String username, Boolean isPermanentBan,
                                                        LocalDateTime unbanTimeStart, LocalDateTime unbanTimeEnd) {
        User user = username != null ? getByUsername(username) : null;
        Page<UserBanData> usersBanData = userBanDataRepository.findByFilters(user, isPermanentBan,
                unbanTimeStart, unbanTimeEnd, pageable);
        return usersBanData.map(userBanDataMapper::toResponseDto);
    }

    @Override
    @Transactional
    public UserBanDataResponseDto updateBanData(UserBanRequestDto request, String targetPublicId) {
        if (!request.getIsPermanentBan() && request.getUnbanAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Specified unbanAt time is before current time");
        }

        User targetUser = getByPublicId(targetPublicId);

        UserBanData userBanData = targetUser.getUserBanData().stream()
                .filter(banData -> !banData.getIsCategoryBan())
                .findAny().orElseThrow(() ->
                        new RuntimeException("Tried to update user ban data for a user without a ban"));

        userBanData.setIsPermanentBan(request.getIsPermanentBan());
        userBanData.setReason(request.getReason());
        userBanData.setUnbanAt(request.getUnbanAt());

        UserBanData updateData = userBanDataRepository.save(userBanData);

        return userBanDataMapper.toResponseDto(updateData);
    }
}