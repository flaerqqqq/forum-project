package com.example.backend.repositories;

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
            AND (:targetType IS NULL OR :targetType = r.targetType)
            AND (:reason IS NULL OR :reason = r.reason)
            AND (:status IS NULL OR :status = r.status)
            """)
    Page<Report> findFilteredPage(@Param("reporterId") String reporterId,
                                  @Param("targetType") ReportTargetType targetType,
                                  @Param("reason") ReportReason reason,
                                  @Param("status") ReportStatus status,
                                  Pageable pageable);
}