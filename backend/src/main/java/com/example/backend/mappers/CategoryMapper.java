package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.CategoryDto;
import com.example.backend.models.Category;
import org.mapstruct.Mapper;

@Mapper(config = MapperConfig.class, uses = {
        CategoryFollowMapper.class
})
public interface CategoryMapper {

    Category toEntity(CategoryDto categoryDto);

    CategoryDto toDto(Category category);
}