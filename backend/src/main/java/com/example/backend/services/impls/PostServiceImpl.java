package com.example.backend.services.impls;

import com.example.backend.dto.PostCreateRequestDto;
import com.example.backend.dto.PostDto;
import com.example.backend.services.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    @Override
    public PostDto createPost(PostCreateRequestDto request, List<MultipartFile> images) {
        return null;
    }
}