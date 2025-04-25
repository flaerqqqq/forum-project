package com.example.backend.services.impls;

import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;
import com.example.backend.documents.Category;
import com.example.backend.dto.CategoryDto;
import com.example.backend.exceptions.CategoryNotFoundException;
import com.example.backend.mappers.CategoryMapper;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.services.CategorySearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.elasticsearch.client.elc.NativeQueryBuilder;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategorySearchServiceImpl implements CategorySearchService {

    private final ElasticsearchOperations elasticsearchOperations;
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public List<CategoryDto> searchCategoriesBySlugOrName(String rawQuery) {
        String queryString = rawQuery.startsWith("c/") ? rawQuery.substring(2) : rawQuery;
        NativeQueryBuilder nativeQueryBuilder = new NativeQueryBuilder();

        Query query = nativeQueryBuilder.withQuery(QueryBuilders.multiMatch(builder ->
                builder
                        .query(queryString)
                        .fields(List.of("slug", "name", "description"))
                        .fuzziness("AUTO")
                        .autoGenerateSynonymsPhraseQuery(true)
        )).build();

        SearchHits<Category> searchHits = elasticsearchOperations.search(query, Category.class);
        return  searchHits.stream()
                .map(SearchHit::getContent)
                .map(this::mapDocumentToDto).toList();
    }

    private CategoryDto mapDocumentToDto(Category categoryDoc) {
        return categoryMapper.toDto(categoryRepository.findBySlug(categoryDoc.getSlug()).orElseThrow(() ->
                new CategoryNotFoundException()));
    }
}