package com.example.backend.dto;

import com.example.backend.models.enums.CategoryModeratorRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ModeratorRoleInfoDto {

    private List<CategoryModeratorRole> roles;

}