package com.example.backend.services;

import com.example.backend.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {

    UserDto findByPublicId(String publicId);

    UserDto findByUsername(String username);

    UserDto updateUser(String publicId, UpdateUserProfileDto updateDto);

    void deleteUser(String publicId);

    String addAvatar(String publicId, MultipartFile file);

    UserBanDataResponseDto ban(UserBanRequestDto request, String moderatorPublicId, String targetPublicId);

    void unban(String targetPublicId);

    Page<UserBanDataResponseDto> findBannedUsers(Pageable pageable, String username);

    UserBanDataResponseDto updateBanData(UserBanRequestDto request, String targetPublicId);
}