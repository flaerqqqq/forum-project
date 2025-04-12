package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.UserReactionDto;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.models.User;
import com.example.backend.models.UserReaction;
import com.example.backend.repositories.UserRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class)
public abstract class UserReactionMapper {

    @Autowired
    private UserRepository userRepository;

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "targetUser.id", target = "targetUserId")
    abstract UserReactionDto toDto(UserReaction userReaction);

    abstract UserReaction toEntity(UserReactionDto userReactionDto);

     public User resolverUser(Long userId) {
        if (userId == null) {
            return null;
        }
         return userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException());
    }

}