package com.example.backend.services;

import com.example.backend.dto.UserReactionDto;
import com.example.backend.models.enums.ReactionType;

public interface ReactionService {

    UserReactionDto reactToUser(String senderUsername, String targetPublicId, ReactionType reactionType);
}