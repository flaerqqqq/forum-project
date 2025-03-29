package com.example.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.dockerjava.zerodep.shaded.org.apache.hc.client5.http.auth.InvalidCredentialsException;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
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

    @Before
    public void setUp() {
        LocalDateTime datetime = LocalDateTime.now();

        registerRequest = RegisterRequestDto.builder()
                .username("username")
                .displayName("displayName")
                .email("email")
                .password("password")
                .description("description");

        registerResponse = RegisterResponseDto.builder()
                .publicId("publicId")
                .username("username")
                .displayName("displayName")
                .email("email")
                .description("description")
                .registrationDate(datetime)
                .lastUpdatedAt(datetime);

        loginRequestDto = LoginRequestDto.builder()
                .username("username")
                .password("passowrd");

        jwtLoginResponseDto = JwtLoginResponseDto.builder()
                .token("token")
                .refreshToken("refreshToken");
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