package com.example.backend.services.impls;

import com.amazonaws.services.codegurureviewer.model.Reaction;
import com.example.backend.dto.UserReactionDto;
import com.example.backend.exceptions.InappropriateReactionTypeException;
import com.example.backend.exceptions.ReactionNotFoundException;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReactionServiceImpl implements ReactionService {

    private final UserReactionMapper userReactionMapper;
    private final UserReactionRepository userReactionRepository;
    private final UserRepository userRepository;


    @Override
    @Transactional
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
                decreaseReactionCount(targetUser, reactionType);
                return UserReactionDto.builder()
                        .type(ReactionType.NO_REACTION)
                        .build();
            } else {
                userReaction.setType(reactionType);
                UserReaction updatedReaction = userReactionRepository.save(userReaction);
                increaseReactionCount(targetUser, reactionType);
                decreaseReactionCount(targetUser, reactionType == ReactionType.LIKE ? ReactionType.DISLIKE : ReactionType.LIKE);
                return userReactionMapper.toDto(updatedReaction);
            }
        }

        UserReaction newCreatedUserReaction = UserReaction.builder()
                .user(sender)
                .targetUser(targetUser)
                .type(reactionType)
                .build();
        UserReaction savedReaction = userReactionRepository.save(newCreatedUserReaction);
        increaseReactionCount(targetUser, reactionType);

        return userReactionMapper.toDto(savedReaction);
    }

    @Override
    public UserReactionDto findReactionBetweenUsers(String senderPublicId, String targetPublicId) {
        UserReaction reaction = userReactionRepository.findReactionBetweenUsers(senderPublicId, targetPublicId).orElseThrow(() ->
                new ReactionNotFoundException("User reaction between two users is not found"));
        return userReactionMapper.toDto(reaction);
    }

    private void increaseReactionCount(User user, ReactionType type) {
        if (type == ReactionType.LIKE) {
            user.setReceivedLikesCount(user.getReceivedLikesCount() + 1);
        } else if (type == ReactionType.DISLIKE) {
            user.setReceivedDislikesCount(user.getReceivedDislikesCount() + 1);
        }
    }

    private void decreaseReactionCount(User user, ReactionType type) {
        if (type == ReactionType.LIKE) {
            user.setReceivedLikesCount(user.getReceivedLikesCount() - 1);
        } else if (type == ReactionType.DISLIKE) {
            user.setReceivedDislikesCount(user.getReceivedDislikesCount() - 1);
        }
    }
}