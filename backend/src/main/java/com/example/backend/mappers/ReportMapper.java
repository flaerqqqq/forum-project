package com.example.backend.mappers;

import com.example.backend.configs.MapperConfig;
import com.example.backend.dto.ReportDto;
import com.example.backend.dto.ReportResponseDto;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.models.Report;
import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = MapperConfig.class)
public abstract class ReportMapper {

    private UserRepository userRepository;

    @Mapping(source = "reporter.publicId", target = "reporterId")
    @Mapping(source = "moderator.publicId", target = "moderatorId")
    public abstract ReportDto toDto(Report report);

    @Mapping(source = "reporter.publicId", target = "reporterId")
    public abstract ReportResponseDto toResponseDto(Report report);

    public User resolveUser(String userPublicId) {
        if (userPublicId == null) return null;
        return userRepository.findByPublicId(userPublicId).orElseThrow(() -> new UserNotFoundException());
    }
}