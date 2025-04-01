package com.example.backend.services.impls;

import com.example.backend.dto.JwtLoginResponseDto;
import com.example.backend.dto.LoginRequestDto;
import com.example.backend.dto.RegisterRequestDto;
import com.example.backend.dto.RegisterResponseDto;
import com.example.backend.exceptions.InvalidCredentialsException;
import com.example.backend.exceptions.RoleNotFoundException;
import com.example.backend.exceptions.UserAlreadyExistsException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.models.Role;
import com.example.backend.models.User;
import com.example.backend.repositories.RoleRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.services.AuthService;
import com.example.backend.services.JwtService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final AuthenticationManager authManager;

    @Override
    public RegisterResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("User already exists with such username=%s."
                    .formatted(request.getUsername()));
        }

        User user = modelMapper.map(request, User.class);

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        user.setPassword(hashedPassword);
        user.setPublicId(UUID.randomUUID().toString());

        Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER).orElseThrow(() ->
                new RoleNotFoundException("ROLE_USER is not found"));
        user.getRoles().add(userRole);

        User savedUser = userRepository.save(user);

        return modelMapper.map(savedUser, RegisterResponseDto.class);
    }

    @Override
    public JwtLoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow(() ->
                new UserNotFoundException("User with such username=%s is not found".formatted(request.getUsername())));

        authenticate(request);

        UserDetails userDetails = new CustomUserDetails(user);
        String token = jwtService.generate(userDetails);

        return JwtLoginResponseDto.builder()
                .token(token)
                .build();
    }

    private void authenticate(LoginRequestDto user) {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                user.getPassword()
        );

        Authentication authenticatedToken = authManager.authenticate(authToken);

        if (!authenticatedToken.isAuthenticated()) {
            throw new InvalidCredentialsException("Invalid credentials while logging in with username=%s"
                    .formatted(user.getUsername()));
        }

        SecurityContextHolder.getContext().setAuthentication(authenticatedToken);
    }
}