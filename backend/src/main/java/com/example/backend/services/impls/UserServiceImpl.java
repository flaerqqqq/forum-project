package com.example.backend.services.impls;

import com.example.backend.dto.UpdateUserProfileDto;
import com.example.backend.dto.UserDto;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.mappers.UserMapper;
import com.example.backend.models.Avatar;
import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.S3Service;
import com.example.backend.services.UserService;
import com.example.backend.utils.ImageValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;



@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final S3Service s3Service;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final ImageValidator imageValidator;

    @Override
    public UserDto findByPublicId(String publicId) {
        User user = userRepository.findByPublicId(publicId).orElseThrow(() ->
                new UserNotFoundException("User with such publicId=%s not found".formatted(publicId)));
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
        User user = userRepository.findByPublicId(publicId).orElseThrow(() ->
                new UserNotFoundException("User with such publicId=%s not found".formatted(publicId)));

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
        if (!userRepository.existsByPublicId(publicId)) {
            throw new UserNotFoundException("User with such publicId=%s not found".formatted(publicId));
        }
        userRepository.deleteByPublicId(publicId);
    }

    @Override
    @Transactional
    public String addAvatar(String publicId, MultipartFile file) {
        User user = userRepository.findByPublicId(publicId).orElseThrow(() ->
                new UserNotFoundException("User with such publicId=%s not found".formatted(publicId)));
        imageValidator.validateAvatar(file);

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
}