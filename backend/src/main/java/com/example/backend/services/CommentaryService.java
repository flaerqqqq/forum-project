package com.example.backend.services;

import com.example.backend.dto.CommentaryCreateRequestDto;
import com.example.backend.dto.CommentaryDto;
import com.example.backend.dto.CommentaryUpdateRequestDto;
import com.example.backend.dto.UserCommentaryResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentaryService {
    CommentaryDto create(CommentaryCreateRequestDto request, String creatorPublicId);

    CommentaryDto getById(Long commentaryId);

    Page<CommentaryDto> getPage(Long postId, Long parentId, Pageable pageable);

    void deleteById(String publicId, Long commentaryId);

    CommentaryDto update(Long commentaryId, CommentaryUpdateRequestDto request, String publicId);

    Page<UserCommentaryResponseDto> getUserCommentaries(String publicId, Pageable pageable);
}