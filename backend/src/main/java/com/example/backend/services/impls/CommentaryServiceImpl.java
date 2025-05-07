package com.example.backend.services.impls;

import com.example.backend.dto.CommentaryCreateRequestDto;
import com.example.backend.dto.CommentaryDto;
import com.example.backend.services.CommentaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentaryServiceImpl implements CommentaryService {
    public CommentaryDto create(CommentaryCreateRequestDto request, String creatorPublicId) {
        return null;
    }
}