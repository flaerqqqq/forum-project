package com.example.backend.aspects;

import com.example.backend.documents.Category;
import com.example.backend.dto.CategoryDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class CategoryServiceAspect {

    private final ElasticsearchOperations elasticsearchOperations;

    @Pointcut("execution(* com.example.backend.services.impls.CategoryServiceImpl.create(..))")
    public void createCategoryMethod() {}

    @Pointcut("execution(* com.example.backend.services.impls.CategoryServiceImpl.update(..))")
    public void updateCategoryMethod() {}

    @Pointcut("execution(* com.example.backend.services.impls.CategoryServiceImpl.deleteCategoryById(..))")
    public void deleteCategoryMethod() {}

    @Pointcut("createCategoryMethod() || updateCategoryMethod()")
    public void categoryIndexingMethods() {}

    @AfterReturning(pointcut = "categoryIndexingMethods()", returning = "result")
    public void indexCategoryAfterReturning(CategoryDto result) {
        if (result != null && result.getId() != null) {
            try {
                Category category = Category.builder()
                        .id(result.getId())
                        .name(result.getName())
                        .slug(result.getSlug())
                        .description(result.getDescription())
                        .postPermission(result.getPostPermission())
                        .followersCount(result.getFollowersCount())
                        .visibility(result.getVisibility())
                        .build();
                elasticsearchOperations.save(category);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }

    @AfterReturning("deleteCategoryMethod()")
    public void deleteCategoryAfterReturning(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();

        if (args != null && args.length > 1 && args[1] instanceof Long) {
            Long categoryId = (Long) args[1];
            try {
                elasticsearchOperations.delete(String.valueOf(categoryId), Category.class);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }
}