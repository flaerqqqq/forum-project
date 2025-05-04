package com.example.backend.aspects;

import com.example.backend.documents.Post;
import com.example.backend.dto.PostDto;
import com.example.backend.repositories.PostDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class PostServiceAspect {

    private final PostDocumentRepository postDocumentRepository;

    @Pointcut("execution(public com.example.backend.dto.PostDto com.example.backend.services.impls.PostServiceImpl.createPost(String, com.example.backend.dto.PostCreateRequestDto, java.util.List))")
    public void createPostMethod() {}

    @Pointcut("execution(public com.example.backend.dto.PostDto com.example.backend.services.impls.PostServiceImpl.update(Long, String, com.example.backend.dto.PostUpdateRequestDto, java.util.List, java.util.List))")
    public void updatePostMethod() {}

    @Pointcut("execution(public void com.example.backend.services.impls.PostServiceImpl.deleteById(String, Long))")
    public void deletePostMethod() {}

    @Pointcut("createPostMethod() || updatePostMethod()")
    public void postIndexingMethods() {}

    @AfterReturning(pointcut = "postIndexingMethods()", returning = "result")
    public void indexPostAfterReturning(PostDto result) {
        if (result != null && result.getId() != null) {
            try {
                Post post = Post.builder()
                        .id(result.getId())
                        .title(result.getTitle())
                        .body(result.getBody())
                        .build();
                Post saved = postDocumentRepository.save(post);
                log.info("post sved {}", saved);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }

    @AfterReturning("deletePostMethod()")
    public void deletePostAfterReturning(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();

        if (args != null && args.length > 1 && args[1] instanceof Long) {
            Long postId = (Long) args[1];
            try {
                postDocumentRepository.deleteById(postId);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }
}