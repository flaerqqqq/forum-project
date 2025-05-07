package com.example.backend.dto;

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
public class CommentaryCreateRequestDto {

    @NotNull(message = "Post id must be present")
    private Long postId;

    @NotBlank(message = "Commentary content must be present")
    @Length(max = 1000, message = "Content length must not exceed 1000 chars")
    private String content;

    private Long parentId;
}