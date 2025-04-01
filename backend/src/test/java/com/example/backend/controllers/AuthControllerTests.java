package com.example.backend.controllers;

import com.example.backend.dto.JwtLoginResponseDto;
import com.example.backend.dto.LoginRequestDto;
import com.example.backend.dto.RegisterRequestDto;
import com.example.backend.dto.RegisterResponseDto;
import com.example.backend.exceptions.UserAlreadyExistsException;
import com.example.backend.exceptions.UserNotFoundException;
import com.example.backend.exceptions.InvalidCredentialsException;
import com.example.backend.filters.JwtAuthorizationFilter;
import com.example.backend.services.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = AuthController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthorizationFilter.class))
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTests {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    AuthService authService;

    private RegisterRequestDto registerRequest;
    private RegisterResponseDto registerResponse;
    private LoginRequestDto loginRequestDto;
    private JwtLoginResponseDto jwtLoginResponseDto;

    @BeforeEach
    public void setUp() {
        LocalDateTime datetime = LocalDateTime.now();

        registerRequest = RegisterRequestDto.builder()
                .username("username")
                .displayName("displayName")
                .email("email@gmail.com")
                .password("password1!")
                .description("description")
                .build();

        registerResponse = RegisterResponseDto.builder()
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
                .build();
    }

    @Test
    public void register_shouldReturn201_whenValidRequest() throws Exception {
        when(authService.register(any(RegisterRequestDto.class))).thenReturn(registerResponse);

        MvcResult mvcResult = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String jsonResponse = mvcResult.getResponse().getContentAsString();
        RegisterResponseDto actualResponse = objectMapper.readValue(jsonResponse, RegisterResponseDto.class);

        assertThat(actualResponse).isEqualTo(registerResponse);
    }

    @Test
    public void register_shouldReturn400_whenInvalidRequest() throws Exception {
        RegisterRequestDto invalidRequest = new RegisterRequestDto(); // Assuming this is invalid

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void register_shouldReturn409_whenUserAlreadyExists() throws Exception {
        when(authService.register(any(RegisterRequestDto.class))).thenThrow(new UserAlreadyExistsException());

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isConflict());
    }

    @Test
    public void register_shouldReturn500_whenInternalError() throws Exception {
        when(authService.register(any(RegisterRequestDto.class))).thenThrow(new RuntimeException());

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    public void login_shouldReturn200_whenValidCredentials() throws Exception {
        when(authService.login(any(LoginRequestDto.class))).thenReturn(jwtLoginResponseDto);

        MvcResult mvcResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequestDto))
        )
                .andExpect(status().isOk())
                .andReturn();

        String responseString = mvcResult.getResponse().getContentAsString();
        JwtLoginResponseDto actualResponse = objectMapper.readValue(responseString, JwtLoginResponseDto.class);

        assertThat(actualResponse).isEqualTo(jwtLoginResponseDto);
    }

    @Test
    public void login_shouldReturn401_whenInvalidCredentials() throws Exception {
        when(authService.login(any(LoginRequestDto.class))).thenThrow(new InvalidCredentialsException());

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequestDto))
        )
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void login_shouldReturn404_whenUserNotFound() throws Exception {
        when(authService.login(any(LoginRequestDto.class))).thenThrow(new UserNotFoundException());

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequestDto))
        )
                .andExpect(status().isNotFound());
    }

    @Test
    public void login_shouldReturn500_whenInternalError() throws Exception {
        when(authService.login(any(LoginRequestDto.class))).thenThrow(new RuntimeException());

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequestDto))
        )
                .andExpect(status().isInternalServerError());
    }
}