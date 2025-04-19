package com.example.backend.dto;

import com.example.backend.models.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReportReviewRequestDto {

    private ReportStatus status;

    private String note;
}