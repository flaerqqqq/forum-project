package com.example.backend.documents;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(indexName = "posts")
public class Post {

    @Id
    private Long id;

    @Field(type = FieldType.Text)
    private String title;

    @Field(type = FieldType.Text)
    private String body;
}