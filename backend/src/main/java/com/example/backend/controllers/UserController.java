package com.example.backend.controllers;

import com.example.backend.dto.*;
import com.example.backend.mappers.CategoryMapper;
import com.example.backend.mappers.PostMapper;
import com.example.backend.mappers.UserMapper;
import com.example.backend.models.enums.ReportReason;
import com.example.backend.models.enums.ReportStatus;
import com.example.backend.models.enums.ReportTargetType;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.services.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PostService postService;
    private final CategoryFollowService categoryFollowService;
    private final CommentaryService commentaryService;
    private final UserMapper userMapper;
    private final PostMapper postMapper;
    private final ReactionService reactionService;
    private final ReportService reportService;
    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;

    @GetMapping("/{userPublicId}")
    public ResponseEntity<UserResponseDto> getUserInfo(@PathVariable String userPublicId) {
        UserDto userDto = userService.findByPublicId(userPublicId);
        return ResponseEntity.ok(userMapper.toResponseDto(userDto));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserResponseDto> getUserInfoByUsername(@PathVariable String username) {
        UserDto userDto = userService.findByUsername(username);
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
                                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        UserReactionDto userReactionDto = reactionService.reactToUser(userDetails.getUsername(), targetPublicId, requestDto.getType());
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
                                                                            @AuthenticationPrincipal CustomUserDetails userDetails) {
        UserDto targetUser = userService.findByPublicId(targetPublicId);
        UserReactionDto userReaction = reactionService.findReactionBetweenUsers(userDetails.getPublicId(),
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
                                                         @AuthenticationPrincipal CustomUserDetails userDetails,
                                                         @RequestParam(required = false) ReportStatus status,
                                                         @RequestParam(required = false) ReportTargetType targetType,
                                                         @RequestParam(required = false) ReportReason reason) {
        Page<ReportDto> response = reportService.findFiltered(userDetails.getPublicId(), targetType, reason, status, pageable);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/me/follows")
    public ResponseEntity<Page<CategoryFollowDto>> findMyFollows(Pageable pageable,
                                                                 @AuthenticationPrincipal CustomUserDetails userDetails) {
        Page<CategoryFollowDto> pageOfCategoryFollows = categoryFollowService.getUserFollows(userDetails.getPublicId(), pageable);

        if (pageOfCategoryFollows.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }

        return ResponseEntity.ok(pageOfCategoryFollows);
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/me/categories")
    public ResponseEntity<Page<CategoryResponseDto>> findMyCategories(Pageable pageable,
                                                              @AuthenticationPrincipal CustomUserDetails userDetails) {
        Page<CategoryDto> pageOfCategories = categoryService.getUserOwnedCategories(userDetails.getPublicId(), pageable);

        if (pageOfCategories.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }

        return ResponseEntity.ok(pageOfCategories.map(categoryMapper::toResponseDto));
    }

    @GetMapping("/me/follows/posts")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<Page<PostResponseDto>> getPostsFromFollowingCategories(Pageable pageable,
                                                                                 @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        Page<PostDto> postsFromFollowing = postService.getPostsByUserFollowedCategories(customUserDetails.getPublicId(), pageable);
        if (postsFromFollowing.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(postsFromFollowing.map(postMapper::toResponseDto));
    }

    @GetMapping("/me/comments")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<Page<UserCommentaryResponseDto>> getUserCommentaries(Pageable pageable,
                                                                               @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        Page<UserCommentaryResponseDto> userCommentaries = commentaryService.getUserCommentaries(customUserDetails.getPublicId(), pageable);
        if (userCommentaries.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(userCommentaries);
    }
}