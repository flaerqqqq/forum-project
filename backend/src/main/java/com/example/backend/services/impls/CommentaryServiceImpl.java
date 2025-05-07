package com.example.backend.services.impls;

import com.example.backend.dto.CommentaryCreateRequestDto;
import com.example.backend.dto.CommentaryDto;
import com.example.backend.exceptions.CommentaryNotFoundException;
import com.example.backend.exceptions.PostNotFoundException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.mappers.CommentaryMapper;
import com.example.backend.models.Commentary;
import com.example.backend.models.Post;
import com.example.backend.models.User;
import com.example.backend.repositories.CommentaryRepository;
import com.example.backend.repositories.PostRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.CommentaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentaryServiceImpl implements CommentaryService {

    private final CommentaryMapper commentaryMapper;
    private final CommentaryRepository commentaryRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Override
    @Transactional
    public CommentaryDto create(CommentaryCreateRequestDto request, String creatorPublicId) {
        User creator = findUserByPublicId(creatorPublicId);
        Post post = findPostById(request.getPostId());

        Commentary commentary = Commentary.builder()
                .content(request.getContent())
                .post(post)
                .createdBy(creator)
                .build();

        if (request.getParentId() != null) {
            Commentary parent = commentaryRepository.findById(request.getParentId()).orElseThrow(() ->
                   new CommentaryNotFoundException(STR."Parent commentary with such id=\{request.getParentId()} not found"));
            commentary.setParent(parent);
        }

        Commentary savedCommentary = commentaryRepository.save(commentary);

        return commentaryMapper.toDto(savedCommentary);
    }

    @Override
    public CommentaryDto getById(Long commentaryId) {
        final Commentary commentary = findCommentaryById(commentaryId);
        return commentaryMapper.toDto(commentary);
    }

    @Override
    @Transactional
    public Page<CommentaryDto> getPage(Long postId, Long parentId, Pageable pageable) {
        Post post = findPostById(postId);
        Page<Commentary> commentaries;
        if (parentId != null) {
            Commentary parent = findCommentaryById(parentId);
            commentaries = commentaryRepository.findCommentariesByPostAndParent(post, parent, pageable);
        } else {
            commentaries = commentaryRepository.findCommentariesByPost(post, pageable);
        }
        return commentaries.map(commentary -> commentaryMapper.toDto(commentary, false));
    }

    private Commentary findCommentaryById(Long commentaryId) {
        return commentaryRepository.findById(commentaryId).orElseThrow(() ->
                new CommentaryNotFoundException(STR."Commentary with such id=\{commentaryId} not found"));
    }

    private Post findPostById(Long postId) {
        return postRepository.findById(postId).orElseThrow(() ->
                new PostNotFoundException(STR."Post with such id=\{postId} not found"));
    }

    private User findUserByPublicId(String creatorPublicId) {
        return userRepository.findByPublicId(creatorPublicId).orElseThrow(() ->
                new UserNotFoundException(STR."User with such publicId=\{creatorPublicId} not found"));
    }
}