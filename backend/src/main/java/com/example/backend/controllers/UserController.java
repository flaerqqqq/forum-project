package com.example.backend.controllers;

import com.example.backend.dto.UpdateUserProfileDto;
import com.example.backend.dto.UserDto;
import com.example.backend.dto.UserResponseDto;
import com.example.backend.mappers.UserMapper;
import com.example.backend.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping("/{userPublicId}")
    public ResponseEntity<UserResponseDto> getUserInfo(@PathVariable String userPublicId) {
        UserDto userDto = userService.findByPublicId(userPublicId);
        return ResponseEntity.ok(userMapper.toResponseDto(userDto));
    }

    @PatchMapping("/{userPublicId}")
    public ResponseEntity<UserResponseDto> updateUser(@PathVariable String userPublicId,
                                                      @RequestBody @Valid UpdateUserProfileDto updateRequest) {
        UserDto userDto = userService.updateUser(userPublicId, updateRequest);
        return ResponseEntity.ok(userMapper.toResponseDto(userDto));
    }

    @PostMapping("/{userPublicId}/avatar")
    public ResponseEntity<String> uploadAvatar(@PathVariable String userPublicId,
                             @RequestParam("avatar") MultipartFile file) {
        String newAvatarUrl = userService.addAvatar(userPublicId, file);
        return ResponseEntity.ok(newAvatarUrl);
    }

    @DeleteMapping("/{userPublicId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable String userPublicId) {
        userService.deleteUser(userPublicId);
    }
}