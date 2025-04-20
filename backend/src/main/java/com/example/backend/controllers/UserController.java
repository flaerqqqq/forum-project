package com.example.backend.controllers;

import com.example.backend.dto.*;
import com.example.backend.mappers.UserMapper;
import com.example.backend.models.UserReaction;
import com.example.backend.models.enums.ReportReason;
import com.example.backend.models.enums.ReportStatus;
import com.example.backend.models.enums.ReportTargetType;
import com.example.backend.services.ReactionService;
import com.example.backend.services.ReportService;
import com.example.backend.services.UserService;
import com.sun.security.auth.UserPrincipal;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final ReportService reportService;

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

    @GetMapping("/{targetPublicId}/reactions")
    public ResponseEntity<UserReactionResponseDto> findReactionBetweenUsers(@PathVariable String targetPublicId,
                                                                           Authentication authentication) {
        UserDto reactionSender = userService.findByUsername(authentication.getName());
        UserDto targetUser = userService.findByPublicId(targetPublicId);
        UserReactionDto userReaction = reactionService.findReactionBetweenUsers(reactionSender.getPublicId(),
                targetPublicId);
        UserReactionResponseDto response = UserReactionResponseDto.builder()
                .type(userReaction.getType())
                .likesCount(targetUser.getReceivedLikesCount())
                .dislikesCount(targetUser.getReceivedDislikesCount())
                .build();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/me/reports")
    public ResponseEntity<Page<ReportDto>> findMyReports(Pageable pageable,
                                                         Authentication authentication,
                                                        @RequestParam(required = false) ReportStatus status,
                                                        @RequestParam(required = false) ReportTargetType targetType,
                                                        @RequestParam(required = false) ReportReason reason) {
        UserDto currentUser = userService.findByUsername(authentication.getName());
        Page<ReportDto> response = reportService.findFiltered(currentUser.getPublicId(), targetType, reason, status, pageable);
        return ResponseEntity.ok(response);
    }
}