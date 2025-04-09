package com.example.backend.repositories;

import com.example.backend.models.EmailConfirmToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailConfirmTokenRepository extends JpaRepository<EmailConfirmToken, Long> {

    Optional<EmailConfirmToken> findByToken(String token);
}