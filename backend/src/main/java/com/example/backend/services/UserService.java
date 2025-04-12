package com.example.backend.services;

import com.example.backend.dto.UpdateUserProfileDto;
import com.example.backend.dto.UserDto;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {

    UserDto findByPublicId(String publicId);

    UserDto updateUser(String publicId, UpdateUserProfileDto updateDto);

    void deleteUser(String publicId);

    String addAvatar(String publicId, MultipartFile file);
}