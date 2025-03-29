package com.example.backend.services.impls;

import com.example.backend.dto.JwtLoginResponseDto;
import com.example.backend.dto.LoginRequestDto;
import com.example.backend.dto.RegisterRequestDto;
import com.example.backend.dto.RegisterResponseDto;
import com.example.backend.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    @Override
    public RegisterResponseDto register(RegisterRequestDto request) {
        return null;
    }

    @Override
    public JwtLoginResponseDto login(LoginRequestDto request) {
        return null;
    }
}