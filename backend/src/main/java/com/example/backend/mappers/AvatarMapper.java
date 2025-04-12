package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.AvatarDto;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.models.Avatar;
import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(config = MapperConfig.class)
public abstract class AvatarMapper {

    @Autowired
    private UserRepository userRepository;

    @Mapping(source = "user", target = "userId")
    public abstract AvatarDto toDto(Avatar avatar);

    @InheritInverseConfiguration
    public abstract Avatar toEntity(AvatarDto avatarDto);

    public User resolveUser(Long userId) {
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException());
    }

    public Long resolveUserId(User user) {
        if (user == null) {
            return null;
        }
        return user.getId();
    }
}