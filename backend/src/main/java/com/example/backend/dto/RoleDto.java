package com.example.backend.dto;

import com.example.backend.models.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoleDto {

    private Long id;

    private Role.RoleName name;
}