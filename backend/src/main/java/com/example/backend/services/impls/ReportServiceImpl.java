package com.example.backend.services.impls;

import com.example.backend.dto.ReportRequestDto;
import com.example.backend.dto.ReportResponseDto;
import com.example.backend.services.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    @Override
    public ReportResponseDto report(String reporterPublicId, ReportRequestDto reportRequest) {
        return null;
    }
}