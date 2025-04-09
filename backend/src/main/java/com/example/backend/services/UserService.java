package com.example.backend.services;

import com.example.backend.dto.UpdateUserProfileDto;
import com.example.backend.dto.UserDto;

public interface UserService {

    UserDto findByPublicId(String publicId);

    UserDto updateUser(String publicId, UpdateUserProfileDto updateDto);
}