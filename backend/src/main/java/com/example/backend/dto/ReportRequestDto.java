package com.example.backend.dto;

import com.example.backend.models.User;
import com.example.backend.models.enums.ReportReason;
import com.example.backend.models.enums.ReportStatus;
import com.example.backend.models.enums.ReportTargetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReportRequestDto {

    private ReportTargetType targetType;

    private String targetId;

    private ReportReason reason;

    private String description;
}