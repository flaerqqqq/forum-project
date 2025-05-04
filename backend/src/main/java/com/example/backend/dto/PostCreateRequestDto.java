package com.example.backend.dto;

import com.example.backend.models.enums.PostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostCreateRequestDto {

    @NotBlank(message = "Category slug is required")
    private String categorySlug;

    @NotBlank(message = "Title is required")
    @Length(min = 10, max = 300, message = "Title must be at least 10 chars long and do not exceed 300 chars")
    private String title;

    @NotBlank(message = "Body is required")
    @Length(min = 10, max = 5000, message = "Body must be at least 10 chars long and do not exceed 5000 chars")
    private String body;

    @NotNull(message = "Post type is required")
    private PostType type;
}