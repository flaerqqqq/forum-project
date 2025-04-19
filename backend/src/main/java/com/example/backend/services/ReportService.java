package com.example.backend.services;

import com.example.backend.dto.ReportDto;
import com.example.backend.dto.ReportRequestDto;
import com.example.backend.dto.ReportResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReportService {

    ReportResponseDto report(String reporterPublicId, ReportRequestDto reportRequest);

    ReportDto findById(Long reportId);

    Page<ReportDto> findPage(Pageable pageable);
}