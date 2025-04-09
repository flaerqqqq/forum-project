package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.UserDto;
import com.example.backend.dto.UserResponseDto;
import com.example.backend.models.User;
import org.mapstruct.Mapper;

@Mapper(config = MapperConfig.class, uses = {RoleMapper.class})
public interface UserMapper {

    UserDto toDto(User user);

    User toEntity(UserDto userDto);

    UserResponseDto toResponseDto(UserDto userDto);
}