package com.example.backend.repositories;

import com.example.backend.models.Report;
import com.example.backend.models.User;
import com.example.backend.models.enums.ReportReason;
import com.example.backend.models.enums.ReportTargetType;
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
}