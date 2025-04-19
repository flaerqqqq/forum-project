package com.example.backend.services.impls;

import com.example.backend.dto.ReportDto;
import com.example.backend.dto.ReportRequestDto;
import com.example.backend.dto.ReportResponseDto;
import com.example.backend.exceptions.ReportNotFoundException;
import com.example.backend.exceptions.SimilarReportException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.mappers.ReportMapper;
import com.example.backend.models.Report;
import com.example.backend.models.User;
import com.example.backend.models.enums.ReportReason;
import com.example.backend.models.enums.ReportStatus;
import com.example.backend.models.enums.ReportTargetType;
import com.example.backend.repositories.ReportRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final ReportMapper reportMapper;

    @Override
    public ReportResponseDto report(String reporterPublicId, ReportRequestDto reportRequest) {
        User reporter = userRepository.findByPublicId(reporterPublicId).orElseThrow(() -> new UserNotFoundException());
        if (reportRequest.getTargetType() == ReportTargetType.USER) {
            return reportUser(reporter, reportRequest);
        }
        return null;
    }

    @Override
    public ReportDto findById(Long reportId) {
        Report report = reportRepository.findById(reportId).orElseThrow(() -> new ReportNotFoundException());
        return reportMapper.toDto(report);
    }

    @Override
    public Page<ReportDto> findFiltered(String reporterId,
                                     ReportTargetType targetType,
                                     ReportReason reason,
                                     ReportStatus status,
                                     Pageable pageable) {
        return reportRepository.findFilteredPage(reporterId, targetType, reason, status, pageable)
                .map(reportMapper::toDto);
    }

    private ReportResponseDto reportUser(User reporter, ReportRequestDto reportRequest) {
        User targetUser = userRepository.findByPublicId(reportRequest.getTargetId()).orElseThrow(() ->
                new UserNotFoundException());

        if (reportRepository.existsSameReport(
                reporter,
                reportRequest.getTargetType(),
                reportRequest.getTargetId(),
                reportRequest.getReason())) {
            throw new SimilarReportException();
        }

        Report report = Report.builder()
                .reporter(reporter)
                .targetId(targetUser.getPublicId())
                .targetType(reportRequest.getTargetType())
                .reason(reportRequest.getReason())
                .description(reportRequest.getDescription())
                .status(ReportStatus.OPEN)
                .build();
        Report savedReport = reportRepository.save(report);

        return reportMapper.toResponseDto(savedReport);
    }
}