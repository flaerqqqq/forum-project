package com.example.backend.services.impls;

import co.elastic.clients.elasticsearch._types.SortOptions;
import co.elastic.clients.elasticsearch._types.query_dsl.Operator;
import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;
import co.elastic.clients.elasticsearch._types.query_dsl.TextQueryType;
import com.example.backend.documents.Post;
import com.example.backend.dto.PostDto;
import com.example.backend.exceptions.PostNotFoundException;
import com.example.backend.mappers.PostMapper;
import com.example.backend.repositories.PostRepository;
import com.example.backend.services.PostSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostSearchServiceImpl implements PostSearchService {

    private final ElasticsearchOperations elasticsearchOperations;
    private final PostMapper postMapper;
    private final PostRepository postRepository;

    @Override
    public Page<PostDto> searchPosts(String rawQuery, Pageable pageable) {
        Query query = NativeQuery.builder()
                .withQuery(QueryBuilders.multiMatch(builder ->
                        builder
                                .query(rawQuery)
                                .fields("title^2", "body")
                                .type(TextQueryType.BestFields)
                                .operator(Operator.And)
                                .fuzziness("AUTO")
                                .autoGenerateSynonymsPhraseQuery(true)
                ))
                .withPageable(pageable)
                .build();

        SearchHits<Post> searchHits = elasticsearchOperations.search(query, Post.class);

        List<PostDto> posts = searchHits.get()
                .map(hit -> mapToDto(hit.getContent()))
                .toList();
        return new PageImpl<>(posts, pageable, posts.size());
    }

    private PostDto mapToDto(Post post) {
        return postMapper.toDto(postRepository.findById(post.getId()).orElseThrow(() ->
                new PostNotFoundException()));
    }
}