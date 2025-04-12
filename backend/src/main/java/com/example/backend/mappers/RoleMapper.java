package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.RoleDto;
import com.example.backend.models.Role;
import org.mapstruct.Mapper;

@Mapper(config = MapperConfig.class)
public interface RoleMapper {

    RoleDto toDto(Role role);

    Role toEntity(RoleDto roleDto);
}