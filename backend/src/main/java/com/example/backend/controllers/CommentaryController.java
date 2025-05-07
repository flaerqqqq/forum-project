package com.example.backend.controllers;

import com.example.backend.dto.CommentaryCreateRequestDto;
import com.example.backend.dto.CommentaryDto;
import com.example.backend.dto.CommentaryResponseDto;
import com.example.backend.mappers.CommentaryMapper;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.services.CommentaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}