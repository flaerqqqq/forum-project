package com.example.backend.services;

import com.example.backend.dto.ReportDto;
import com.example.backend.dto.ReportRequestDto;
import com.example.backend.dto.ReportResponseDto;

public interface ReportService {

    ReportResponseDto report(String reporterPublicId, ReportRequestDto reportRequest);

    ReportDto findById(Long reportId);
}