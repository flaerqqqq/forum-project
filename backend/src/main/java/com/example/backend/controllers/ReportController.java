package com.example.backend.controllers;

import com.example.backend.dto.*;
import com.example.backend.models.enums.ReportReason;
import com.example.backend.models.enums.ReportStatus;
import com.example.backend.models.enums.ReportTargetType;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.services.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping
    public ResponseEntity<ReportResponseDto> report(@RequestBody ReportRequestDto request,
                                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReportResponseDto responseDto = reportService.report(userDetails.getPublicId(), request);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ROLE_MODERATOR')")
    @GetMapping("/{reportId}")
    public ResponseEntity<ReportDto> findReportById(@PathVariable Long reportId) {
        ReportDto response = reportService.findById(reportId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ROLE_MODERATOR')")
    @GetMapping
    public ResponseEntity<Page<ReportDto>> findPage(Pageable pageable,
                                                    @RequestParam(required = false) ReportStatus status,
                                                    @RequestParam(required = false) ReportTargetType targetType,
                                                    @RequestParam(required = false) ReportReason reason,
                                                    @RequestParam(required = false) String reporterId) {
        Page<ReportDto> response = reportService.findFiltered(reporterId, targetType, reason, status, pageable);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ROLE_MODERATOR')")
    @PutMapping("/{reportId}")
    public ResponseEntity<ReportDto> review(@PathVariable Long reportId,
                                            @RequestBody ReportReviewRequestDto reviewRequest,
                                            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReportDto response = reportService.review(reportId, userDetails.getUsername(), reviewRequest);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ROLE_MODERATOR')")
    @DeleteMapping("/{reportId}")
    public ResponseEntity<Void> deleteReportById(@PathVariable Long reportId) {
        reportService.deleteById(reportId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reasons")
    public ResponseEntity<ReportReason[]> getReasons() {
        return ResponseEntity.ok(ReportReason.values());
    }

    @GetMapping("/statuses")
    public ResponseEntity<ReportStatus[]> getStatuses() {
        return ResponseEntity.ok(ReportStatus.values());
    }
}