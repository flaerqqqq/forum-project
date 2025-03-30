package com.example.backend.services;

import com.example.backend.dto.JwtLoginResponseDto;
import com.example.backend.dto.LoginRequestDto;
import com.example.backend.dto.RegisterRequestDto;
import com.example.backend.dto.RegisterResponseDto;
import com.example.backend.exceptions.InvalidCredentialsException;
import com.example.backend.exceptions.UserAlreadyExistsException;
import com.example.backend.exceptions.UserNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import javax.management.relation.RoleNotFoundException;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@SpringBootTest
public class AuthServiceTests {

    @MockitoBean
    PasswordEncoder passwordEncoder;

    @MockitoBean
    UserRepository userRepository;

    @MockitoBean
    RoleRepository roleRepository;

    @MockitoBean
    AuthenticationManager authManager;

    @Autowired
    AuthService authService;

    private final String password = "password";
    private final String token = "token";
    private final String refreshToken = "refreshToken";
    private final LocalDateTime datetime = LocalDateTime.now();

    private User user;
    private UserDetails customUserDetails;
    private Role userRole;
    private RegisterRequestDto registerRequestDto;
    private RegisterResponseDto registerResponseDto;
    private LoginRequestDto loginRequestDto;
    private JwtLoginResponseDto jwtLoginResponseDto;
    private Authentication authenticatedToken;
    private Authentication unauthenticatedToken;

    @BeforeEach
    public void setUp() {

        user = User.builder()
                .id(1L)
                .publicId("publicId")
                .username("username")
                .displayName("displayName")
                .email("email@gmail.com")
                .password(password)
                .description("description")
                .postsCount(0L)
                .receivedLikesCount(0L)
                .receivedDislikesCount(0L)
                .avatarUrl("avatarUrl")
                .registrationDate(datetime)
                .lastUpdatedAt(datetime)
                .emailVerified(true)
                .build();

        customUserDetails = new CustomUserDetails(user);

        userRole = Role.builder()
                .id(1L)
                .name(Role.RoleName.USER_ROLE)
                .build();

        user.getRoles().add(userRole);

        registerRequestDto = RegisterRequestDto.builder()
                .username("username")
                .displayName("displayName")
                .email("email@gmail.com")
                .password("password1!")
                .description("description")
                .build();

        registerResponseDto = RegisterResponseDto.builder()
                .publicId("publicId")
                .username("username")
                .displayName("displayName")
                .email("email@gmail.com")
                .description("description")
                .registrationDate(datetime)
                .lastUpdatedAt(datetime)
                .build();

        loginRequestDto = LoginRequestDto.builder()
                .username("username")
                .password("password1!")
                .build();

        jwtLoginResponseDto = JwtLoginResponseDto.builder()
                .token("token")
                .refreshToken("refreshToken")
                .build();

        authenticatedToken = new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                password,
                customUserDetails.getAuthorities()
        );
        authenticatedToken.setAuthenticated(true);

        unauthenticatedToken = new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                password,
                customUserDetails.getAuthorities()
        );
    }

    @Test
    public void register_shouldReturnResponse_whenValidRequest() {
        when(passwordEncoder.encode(anyString())).thenReturn(password);
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(roleRepository.findByUsername(anyString())).thenReturn(userRole);

        RegisterResponseDto actualResponse = authService.register(registerRequestDto);

        assertThat(actualResponse).isEqualTo(registerResponseDto);
    }

    @Test
    public void register_shouldThrow_whenUserAlreadyExists() {
        when(userRepository.existsByUsername(anyString())).thenThrow(UserAlreadyExistsException.class);

        assertThrows(UserAlreadyExistsException.class, () -> authService.register(registerRequestDto));
    }

    @Test
    public void register_shouldThrow_whenRoleNotFound() {
        when(roleRepository.findByName(anyString())).thenReturn(Optional.empty());

        assertThrows(RoleNotFoundException.class, () -> authService.register(registerRequestDto));
    }

    @Test
    public void login_shouldReturnResponse_whenCredentialsValid() {
        when(userRepository.findByUsername(anyString())).thenReturn(user);
        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authenticatedToken);
        when(jwtService.generate(any(UserDetails.class))).thenReturn(token);
        when(refreshTokenService.generate(anyLong())).thenReturn(refreshToken);

        JwtLoginResponseDto actualResponse = authService.login(loginRequestDto);

        assertThat(actualResponse).isEqualTo(jwtLoginResponseDto);
    }

    @Test
    public void login_shouldThrow_whenUserNotFound() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> authService.login(loginRequestDto));
    }

    @Test
    public void login_shouldThrow_whenPasswordIncorrect() {
        when(userRepository.findByUsername(anyString())).thenReturn(user);
        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(unauthenticatedToken);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(loginRequestDto));
    }
}