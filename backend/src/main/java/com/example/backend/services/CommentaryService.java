package com.example.backend.services;

import com.example.backend.dto.CommentaryCreateRequestDto;
import com.example.backend.dto.CommentaryDto;

public interface CommentaryService {
    CommentaryDto create(CommentaryCreateRequestDto request, String creatorPublicId);

    CommentaryDto getById(Long commentaryId);
}