package com.example.backend.repositories;

import com.example.backend.models.EmailConfirmToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailConfirmRepository extends JpaRepository<EmailConfirmToken, Long> {
}