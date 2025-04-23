package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.AvatarDto;
import com.example.backend.dto.UserDto;
import com.example.backend.dto.UserResponseDto;
import com.example.backend.models.User;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = MapperConfig.class, uses = {
        RoleMapper.class,
        AvatarMapper.class,
        UserReactionMapper.class,
        ReportMapper.class,
        CategoryFollowMapper.class
})
public interface UserMapper {

    @Mapping(source = "avatar", target = "avatarDto")
    UserDto toDto(User user);

    @InheritInverseConfiguration
    User toEntity(UserDto userDto);

    @Mapping(source = "avatarDto", target = "avatarUrl")
    UserResponseDto toResponseDto(UserDto userDto);

    default String resolveAvatarUrl(AvatarDto avatarDto) {
        if (avatarDto == null) {
            return null;
        }
        return avatarDto.getUrl();
    }

}