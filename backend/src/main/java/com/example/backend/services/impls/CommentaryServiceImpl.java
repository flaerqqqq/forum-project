package com.example.backend.services.impls;

import com.example.backend.dto.CommentaryCreateRequestDto;
import com.example.backend.dto.CommentaryDto;
import com.example.backend.dto.CommentaryUpdateRequestDto;
import com.example.backend.dto.UserCommentaryResponseDto;
import com.example.backend.exceptions.CommentaryNotFoundException;
import com.example.backend.exceptions.PostNotFoundException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.mappers.CommentaryMapper;
import com.example.backend.models.*;
import com.example.backend.repositories.CommentaryRepository;
import com.example.backend.repositories.PostRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.CommentaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Stream;

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

        post.setCommentsCount(post.getCommentsCount() + 1);

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
        return commentaries.map(commentary -> commentaryMapper.toDto(commentary));
    }

    @Override
    @Transactional
    public void deleteById(String publicId, Long commentaryId) {
        checkAuthorizedUser(publicId, commentaryId);

        Commentary commentary = findCommentaryById(commentaryId);
        Post post = commentary.getPost();
        post.setCommentsCount(post.getCommentsCount() - countNestedComments(commentary));

        commentaryRepository.deleteById(commentaryId);
    }

    @Override
    @Transactional
    public CommentaryDto update(Long commentaryId, CommentaryUpdateRequestDto request, String publicId) {
        checkAuthorizedUser(publicId, commentaryId);

        Commentary commentary = findCommentaryById(commentaryId);
        commentary.setContent(request.getContent());

        Commentary updatedCommentary = commentaryRepository.save(commentary);

        return commentaryMapper.toDto(updatedCommentary);
    }

    @Override
    @Transactional
    public Page<UserCommentaryResponseDto> getUserCommentaries(String publicId, Pageable pageable) {
        User user = findUserByPublicId(publicId);

        Page<UserCommentaryResponseDto> userCommentaries = commentaryRepository.findByCreatedBy(user, pageable).map(com -> {
            Post post = com.getPost();
            Category category = post.getCategory();

            return UserCommentaryResponseDto.builder()
                    .id(com.getId())
                    .content(com.getContent())
                    .createdAt(com.getCreatedAt())
                    .updatedAt(com.getUpdatedAt())
                    .categorySlug(category.getSlug())
                    .categoryName(category.getName())
                    .categoryIconUrl(category.getIconUrl())
                    .postId(post.getId())
                    .postTitle(post.getTitle())
                    .parentCommentUsername(com.getParent() != null ? com.getParent().getCreatedBy().getUsername() : null)
                    .build();
        });

        return userCommentaries;
    }

    private void checkAuthorizedUser(String publicId, Long commentaryId) {
        User user = findUserByPublicId(publicId);
        Commentary commentary = findCommentaryById(commentaryId);

        boolean isAllowed = false;

        if (commentary.getCreatedBy().equals(user)) isAllowed = true;
        if (user.getRoles().stream()
                .anyMatch(role -> role.getName() == Role.RoleName.ROLE_MODERATOR)) isAllowed = true;

        if (!isAllowed)
            throw new AccessDeniedException(STR."User with such publicId=\{publicId} now allowed to delete commentary with id=\{commentaryId}");
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

    private long countNestedComments(Commentary root) {
        return Stream.concat(
                Stream.of(root),
                root.getReplies().stream().flatMap(this::flatten)
        ).count();
    }

    private Stream<Commentary> flatten(Commentary commentary) {
        return Stream.concat(
                Stream.of(commentary),
                commentary.getReplies().stream().flatMap(this::flatten)
        );
    }

}