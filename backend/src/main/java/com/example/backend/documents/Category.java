package com.example.backend.documents;

import com.example.backend.models.enums.PostPermission;
import com.example.backend.models.enums.Visibility;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.core.suggest.Completion;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(indexName = "categories")
public class Category {

    @Id
    private Long id;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String name;

    @Field(type = FieldType.Keyword)
    private String slug;

    @Field(type = FieldType.Keyword)
    private Visibility visibility;

    @Field(type = FieldType.Keyword, name = "post_permission")
    private PostPermission postPermission;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String description;

    @Field(type = FieldType.Long, name = "followers_count")
    private Long followersCount = 0L;

    @Field(type = FieldType.Date, name = "created_at")
    private LocalDateTime createdAt;

    @Field(type = FieldType.Date, name = "updated_at")
    private LocalDateTime updatedAt;
}