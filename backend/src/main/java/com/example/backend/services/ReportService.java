package com.example.backend.services;

import com.example.backend.dto.ReportDto;
import com.example.backend.dto.ReportRequestDto;
import com.example.backend.dto.ReportResponseDto;
import com.example.backend.dto.ReportReviewRequestDto;
import com.example.backend.models.enums.ReportReason;
import com.example.backend.models.enums.ReportStatus;
import com.example.backend.models.enums.ReportTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReportService {

    ReportResponseDto report(String reporterPublicId, ReportRequestDto reportRequest);

    ReportDto findById(Long reportId);

    Page<ReportDto> findFiltered(String reporterId,
                                     ReportTargetType targetType,
                                     ReportReason reason,
                                     ReportStatus status,
                                     Pageable pageable);

    ReportDto review(Long reportId, String moderatorUsername, ReportReviewRequestDto reviewRequest);

    void deleteById(Long reportId);
}