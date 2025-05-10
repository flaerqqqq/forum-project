package com.example.backend.repositories;

import com.example.backend.dto.ReportDto;
import com.example.backend.models.Category;
import com.example.backend.models.Report;
import com.example.backend.models.User;
import com.example.backend.models.enums.ReportReason;
import com.example.backend.models.enums.ReportStatus;
import com.example.backend.models.enums.ReportTargetType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends JpaRepository<Report, Long> {

    @Query("""
        SELECT count(r) > 0 FROM Report r
        WHERE r.reporter = :reporter
        AND r.targetType = :targetType
        AND r.targetId = :targetId
        AND r.reason = :reason
    """)
    boolean existsSameReport(@Param("reporter") User reporter,
                             @Param("targetType") ReportTargetType targetType,
                             @Param("targetId") String targetId,
                             @Param("reason") ReportReason reason);

    @Query("""
            SELECT r FROM Report r
            WHERE (:reporterId IS NULL OR :reporterId = r.reporter.publicId)
            AND (r.targetType = "USER" OR r.targetType = "CATEGORY")
            AND (:targetType IS NULL OR :targetType = r.targetType)
            AND (:reason IS NULL OR :reason = r.reason)
            AND (:status IS NULL OR :status = r.status)
            """)
    Page<Report> findFilteredPageForModerator(@Param("reporterId") String reporterId,
                                  @Param("targetType") ReportTargetType targetType,
                                  @Param("reason") ReportReason reason,
                                  @Param("status") ReportStatus status,
                                  Pageable pageable);

    @Query("""
            SELECT r FROM Report r
            WHERE (:reporterId IS NULL OR :reporterId = r.reporter.publicId)
            AND (:targetType IS NULL OR :targetType = r.targetType)
            AND (:reason IS NULL OR :reason = r.reason)
            AND (:status IS NULL OR :status = r.status)
            """)
    Page<Report> findFilteredPage(@Param("reporterId") String reporterId,
                                  @Param("targetType") ReportTargetType targetType,
                                  @Param("reason") ReportReason reason,
                                  @Param("status") ReportStatus status,
                                  Pageable pageable);

    @Query("""
    SELECT r FROM Report r
    LEFT JOIN Post p ON r.targetType = 'POST' AND CAST(r.targetId AS biginteger) = p.id
    LEFT JOIN Commentary c ON r.targetType = 'COMMENTARY' AND CAST(r.targetId AS biginteger) = c.id
    LEFT JOIN Post cp ON c.post.id = cp.id 
    WHERE
        (:categoryId IS NULL
            OR (
                (r.targetType = 'POST' AND p.category.id = :categoryId)
                OR (r.targetType = 'COMMENTARY' AND c.post.category.id = :categoryId)
            )
        )
        AND (:status IS NULL OR r.status = :status)
        AND (:reason IS NULL OR r.reason = :reason)
        AND (:targetType IS NULL OR r.targetType = :targetType)
        AND (:reporterId IS NULL OR r.reporter.publicId = :reporterId)
    """)
    Page<Report> findCategoryReportsWithFilters(
            @Param("categoryId") Long categoryId,
            @Param("targetType") ReportTargetType targetType,
            @Param("reason") ReportReason reason,
            @Param("status") ReportStatus status,
            @Param("reporterId") String reporterId,
            Pageable pageable
    );
}