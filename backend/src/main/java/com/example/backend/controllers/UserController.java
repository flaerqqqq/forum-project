package com.example.backend.controllers;

import com.example.backend.dto.*;
import com.example.backend.mappers.UserMapper;
import com.example.backend.models.UserReaction;
import com.example.backend.services.ReactionService;
import com.example.backend.services.UserService;
import com.sun.security.auth.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final ReactionService reactionService;

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

    @PreAuthorize("hasAnyRole('ROLE_USER')")
    @PostMapping("/{targetPublicId}/reactions")
    public ResponseEntity<UserReactionResponseDto> reactToUser(@PathVariable String targetPublicId,
                                                               @RequestBody UserReactionRequestDto requestDto,
                                                               Authentication auth) {
        UserReactionDto userReactionDto = reactionService.reactToUser(auth.getName(), targetPublicId, requestDto.getType());
        UserDto userDto = userService.findByPublicId(targetPublicId);
        UserReactionResponseDto response = UserReactionResponseDto.builder()
                .type(userReactionDto.getType())
                .likesCount(userDto.getReceivedLikesCount())
                .dislikesCount(userDto.getReceivedDislikesCount())
                .build();
        return ResponseEntity.ok(response);
    }
}