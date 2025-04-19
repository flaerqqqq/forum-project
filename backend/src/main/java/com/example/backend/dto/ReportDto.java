package com.example.backend.dto;

import com.example.backend.models.enums.ReportReason;
import com.example.backend.models.enums.ReportStatus;
import com.example.backend.models.enums.ReportTargetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReportDto {

    private Long id;

    private String reporterId;

    private ReportTargetType targetType;

    private String targetId;

    private ReportReason reason;

    private String description;

    private LocalDateTime reportedAt;

    private String moderatorId;

    private String moderatorNote;

    private LocalDateTime reviewedAt;

    private ReportStatus status;
}