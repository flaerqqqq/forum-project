package com.example.backend.controllers;

import com.example.backend.dto.ReportDto;
import com.example.backend.dto.ReportRequestDto;
import com.example.backend.dto.ReportResponseDto;
import com.example.backend.dto.UserDto;
import com.example.backend.services.ReportService;
import com.example.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final UserService userService;
    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ReportResponseDto> report(@RequestBody ReportRequestDto request,
                                                    Authentication authentication) {
        UserDto reporterDto = userService.findByUsername(authentication.getName());
        ReportResponseDto responseDto = reportService.report(reporterDto.getPublicId(), request);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<ReportDto> findReportById(@PathVariable Long reportId) {
        ReportDto response = reportService.findById(reportId);
        return ResponseEntity.ok(response);
    }
}