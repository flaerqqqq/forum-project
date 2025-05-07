package com.example.backend.repositories;

import com.example.backend.models.Commentary;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentaryRepository extends JpaRepository<Commentary, Long> {

}