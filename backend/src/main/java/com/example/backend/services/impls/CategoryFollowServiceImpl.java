package com.example.backend.services.impls;

import com.example.backend.dto.CategoryFollowDto;
import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.CategoryFollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryFollowServiceImpl implements CategoryFollowService {

    private final UserRepository userRepository;

    @Override
    public CategoryFollowDto follow(String publicId, String categorySlug) {
        User user = userRepository.findByPublicId(publicId).orElseThrow(() ->
                new U)
    }

    @Override
    public void deleteFollow(String publicId, String categorySlug, Long followId) {

    }
}