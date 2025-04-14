package com.example.backend.repositories;

import com.example.backend.models.User;
import com.example.backend.models.UserReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserReactionRepository extends JpaRepository<UserReaction, Long> {

    Optional<UserReaction> findByUserAndTargetUser(User user, User targetUser);
}