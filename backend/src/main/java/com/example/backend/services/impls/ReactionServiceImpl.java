package com.example.backend.services.impls;

import com.example.backend.dto.UserReactionDto;
import com.example.backend.exceptions.InappropriateReactionTypeException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.mappers.UserReactionMapper;
import com.example.backend.models.User;
import com.example.backend.models.UserReaction;
import com.example.backend.models.enums.ReactionType;
import com.example.backend.repositories.UserReactionRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.ReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReactionServiceImpl implements ReactionService {

    private final UserReactionMapper userReactionMapper;
    private final UserReactionRepository userReactionRepository;
    private final UserRepository userRepository;


    @Override
    public UserReactionDto reactToUser(String senderUsername, String targetPublicId, ReactionType reactionType) {
        if (reactionType != ReactionType.LIKE && reactionType != ReactionType.DISLIKE)
            throw new InappropriateReactionTypeException("ReactionType must be either LIKE or DISLIKE");

        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new UserNotFoundException());
        User targetUser = userRepository.findByPublicId(targetPublicId)
                .orElseThrow(() -> new UserNotFoundException());

        Optional<UserReaction> userReactionOpt = userReactionRepository.findByUserAndTargetUser(sender, targetUser);
        if (userReactionOpt.isPresent()) {
            UserReaction userReaction = userReactionOpt.get();
            if (userReaction.getType() == reactionType) {
                userReactionRepository.delete(userReaction);
                return UserReactionDto.builder()
                        .type(ReactionType.NO_REACTION)
                        .build();
            } else {
                userReaction.setType(reactionType);
                UserReaction updatedReaction = userReactionRepository.save(userReaction);
                return userReactionMapper.toDto(updatedReaction);
            }
        }

        UserReaction newCreatedUserReaction = UserReaction.builder()
                .user(sender)
                .targetUser(targetUser)
                .type(reactionType)
                .build();
        UserReaction savedReaction = userReactionRepository.save(newCreatedUserReaction);

        return userReactionMapper.toDto(savedReaction);
    }
}