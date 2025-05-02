package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostImageDto {

    private Long id;

    private String url;

    private Integer width;

    private Integer height;

    private Long postId;
}