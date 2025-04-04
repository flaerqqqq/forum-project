package com.example.backend.services;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public interface JwtService {

    String generate(UserDetails userDetails);

    String extractUsername(String token);

    List<GrantedAuthority> extractAuthorities(String token);

    void validate(String token);
}