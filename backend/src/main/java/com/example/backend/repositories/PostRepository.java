package com.example.backend.repositories;

import aj.org.objectweb.asm.commons.Remapper;
import com.example.backend.models.Category;
import com.example.backend.models.Post;
import com.example.backend.models.User;
import com.example.backend.models.enums.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("""
    SELECT p FROM Post p
    WHERE (:type IS NULL OR p.type = :type)
      AND (:creator IS NULL OR p.creator = :creator)
      AND (:category IS NULL OR p.category = :category)
      AND (
            p.category.visibility = 'PUBLIC'
            OR :caller IS NOT NULL AND (
                p.category.createdBy = :caller
                OR EXISTS (
                    SELECT 1 FROM CategoryModerator cm 
                    WHERE cm.category = p.category AND cm.user = :caller
                )
            )
      )
    """)
    Page<Post> findFilteredPage(@Param("type") PostType type,
                                @Param("creator") User creator,
                                @Param("category") Category category,
                                @Param("caller") User caller,
                                Pageable pageable);


    @Query("""
    SELECT p FROM Post p
    JOIN p.category c
    JOIN CategoryFollow cf ON cf.category = c
    WHERE cf.user = :user
    AND (
        c.visibility = 'PUBLIC'
        OR :caller IS NOT NULL AND (
            c.createdBy = :caller
            OR EXISTS (
                SELECT 1 FROM CategoryModerator cm 
                WHERE cm.category = c AND cm.user = :caller
            )
        )
    )
    """)
    Page<Post> findPostsFromUserFollowing(@Param("user") User user,
                                          @Param("caller") User caller, Pageable pageable);

}