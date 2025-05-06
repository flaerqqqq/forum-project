package com.example.backend.repositories;

import com.example.backend.documents.Post;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface PostDocumentRepository extends ElasticsearchRepository<Post, Long> {
}