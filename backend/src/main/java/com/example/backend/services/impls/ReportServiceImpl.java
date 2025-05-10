package com.example.backend.services.impls;

import com.example.backend.dto.ReportDto;
import com.example.backend.dto.ReportRequestDto;
import com.example.backend.dto.ReportResponseDto;
import com.example.backend.dto.ReportReviewRequestDto;
import com.example.backend.exceptions.*;
import com.example.backend.mappers.ReportMapper;
import com.example.backend.models.*;
import com.example.backend.models.enums.ReportReason;
import com.example.backend.models.enums.ReportStatus;
import com.example.backend.models.enums.ReportTargetType;
import com.example.backend.repositories.*;
import com.example.backend.services.ReportService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final ReportMapper reportMapper;
    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final CommentaryRepository commentaryRepository;

    @Override
    public ReportResponseDto report(String reporterPublicId, ReportRequestDto reportRequest) {
        User reporter = userRepository.findByPublicId(reporterPublicId).orElseThrow(() -> new UserNotFoundException());
        if (reportRequest.getTargetType() == ReportTargetType.USER) {
            return reportUser(reporter, reportRequest);
        } else if (reportRequest.getTargetType() == ReportTargetType.POST) {
            return reportPost(reporter, reportRequest);
        } else if (reportRequest.getTargetType() == ReportTargetType.CATEGORY) {
            return reportCategory(reporter, reportRequest);
        } else if (reportRequest.getTargetType() == ReportTargetType.COMMENTARY) {
            return reportCommentary(reporter, reportRequest);
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

    @Override
    @Transactional
    public ReportDto review(Long reportId, String moderatorUsername, ReportReviewRequestDto reviewRequest) {
        Report report = reportRepository.findById(reportId).orElseThrow(() -> new ReportNotFoundException());
        User moderator = userRepository.findByUsername(moderatorUsername).orElseThrow(() -> new UserNotFoundException());

        report.setStatus(reviewRequest.getStatus());
        report.setModerator(moderator);
        report.setReviewedAt(LocalDateTime.now());
        report.setModeratorNote(reviewRequest.getNote());

        Report updatedReport = reportRepository.save(report);

        return reportMapper.toDto(updatedReport);
    }

    @Override
    public void deleteById(Long reportId) {
        if (reportRepository.existsById(reportId)) {
            reportRepository.deleteById(reportId);
        } else {
            throw new ReportNotFoundException();
        }
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


    private ReportResponseDto reportPost(User reporter, ReportRequestDto reportRequest) {
        Post targetPost = postRepository.findById(Long.parseLong(reportRequest.getTargetId())).orElseThrow(() ->
                new PostNotFoundException());

        return getReportResponseDtoForNonUserReport(reporter, reportRequest, targetPost.getId());
    }

    private ReportResponseDto reportCategory(User reporter, ReportRequestDto reportRequest) {
        Category targetCategory = categoryRepository.findById(Long.parseLong(reportRequest.getTargetId())).orElseThrow(() ->
                new CategoryNotFoundException());

        return getReportResponseDtoForNonUserReport(reporter, reportRequest, targetCategory.getId());
    }

    private ReportResponseDto reportCommentary(User reporter, ReportRequestDto reportRequest) {
        Commentary targetCommentary = commentaryRepository.findById(Long.parseLong(reportRequest.getTargetId())).orElseThrow(() ->
                new CommentaryNotFoundException());

        return getReportResponseDtoForNonUserReport(reporter, reportRequest, targetCommentary.getId());
    }

    private ReportResponseDto getReportResponseDtoForNonUserReport(User reporter, ReportRequestDto reportRequest, Long id) {
        if (reportRepository.existsSameReport(
                reporter,
                reportRequest.getTargetType(),
                reportRequest.getTargetId(),
                reportRequest.getReason())) {
            throw new SimilarReportException();
        }

        Report report = Report.builder()
                .reporter(reporter)
                .targetId(String.valueOf(id))
                .targetType(reportRequest.getTargetType())
                .reason(reportRequest.getReason())
                .description(reportRequest.getDescription())
                .status(ReportStatus.OPEN)
                .build();
        Report savedReport = reportRepository.save(report);

        return reportMapper.toResponseDto(savedReport);
    }
}