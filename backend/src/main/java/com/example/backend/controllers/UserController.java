package com.example.backend.controllers;

import com.example.backend.dto.UserDto;
import com.example.backend.dto.UserResponseDto;
import com.example.backend.mappers.UserMapper;
import com.example.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}