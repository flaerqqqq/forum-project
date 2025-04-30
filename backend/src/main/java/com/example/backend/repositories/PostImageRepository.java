package com.example.backend.repositories;

import com.example.backend.models.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostImageRepository extends JpaRepository<PostImage, Long> {

    Optional<PostImage> findByUrl(String url);
}