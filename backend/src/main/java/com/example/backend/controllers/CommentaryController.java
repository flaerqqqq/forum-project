package com.example.backend.controllers;

import com.example.backend.dto.CommentaryCreateRequestDto;
import com.example.backend.dto.CommentaryDto;
import com.example.backend.dto.CommentaryResponseDto;
import com.example.backend.dto.CommentaryUpdateRequestDto;
import com.example.backend.mappers.CommentaryMapper;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.services.CommentaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/commentaries")
@RequiredArgsConstructor
public class CommentaryController {

    private final CommentaryMapper commentaryMapper;
    private final CommentaryService commentaryService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<CommentaryResponseDto> create(@RequestBody CommentaryCreateRequestDto request,
                                                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        CommentaryDto commentaryDto = commentaryService.create(request, customUserDetails.getPublicId());
        URI resourceLocation = URI.create(STR."/api/v1/commentaries/\{commentaryDto.getId()}");
        return ResponseEntity.created(resourceLocation).body(commentaryMapper.toResponseDto(commentaryDto));
    }

    @GetMapping("/{commentaryId}")
    public ResponseEntity<CommentaryResponseDto> getById(@PathVariable Long commentaryId) {
        CommentaryDto commentaryDto = commentaryService.getById(commentaryId);
        return ResponseEntity.ok(commentaryMapper.toResponseDto(commentaryDto));
    }

    @GetMapping()
    public ResponseEntity<Page<CommentaryResponseDto>> getPage(@RequestParam(value = "parentId", required = false) Long parentId,
                                                               @RequestParam("postId") Long postId,
                                                               Pageable pageable) {
        Page<CommentaryDto> pageOfCommentaries = commentaryService.getPage(postId, parentId, pageable);
        if (pageOfCommentaries.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(pageOfCommentaries.map(com -> commentaryMapper.toResponseDto(com, false)));
    }

    @DeleteMapping("/{commentaryId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<Void> deleteById(@PathVariable Long commentaryId,
                                           @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        commentaryService.deleteById(customUserDetails.getPublicId(), commentaryId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{commentaryId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<CommentaryResponseDto> update(@PathVariable Long commentaryId,
                                       @RequestBody CommentaryUpdateRequestDto request,
                                       @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        CommentaryDto updatedCommentary = commentaryService.update(commentaryId, request, customUserDetails.getPublicId());
        return ResponseEntity.ok(commentaryMapper.toResponseDto(updatedCommentary, false));
    }
}