package com.example.backend.repositories;

import com.example.backend.models.Commentary;
import com.example.backend.models.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentaryRepository extends JpaRepository<Commentary, Long> {

    @Query("""
            SELECT c FROM Commentary c
            WHERE (c.parent = :parent)
            AND (c.post = :post)
            """)
    Page<Commentary> findCommentariesByPostAndParent(@Param("post") Post post,
                                                     @Param("parent") Commentary parent,
                                                     Pageable pageable);

    @Query("""
            SELECT c FROM Commentary c
            WHERE (c.post = :post)
            AND (c.parent IS NULL)
            """)
    Page<Commentary> findCommentariesByPost(@Param("post") Post post, Pageable pageable);
}