package com.example.backend.filters;

import com.example.backend.security.CustomUserDetails;
import com.example.backend.services.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthorizationFilter extends OncePerRequestFilter {

    private final static String BEARER_HEADER = "Bearer ";
    private final static String AUTH_HEADER = "Authorization";

    private final JwtService jwtService;
    private final UserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String headerValue = request.getHeader(AUTH_HEADER);

        if (headerValue != null && headerValue.startsWith(BEARER_HEADER)) {
            String token = headerValue.substring(7);

            try {
                jwtService.validate(token);
                String username = jwtService.extractUsername(token);
                List<GrantedAuthority> authorities = jwtService.extractAuthorities(token);

                if (username == null) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token: username not found");
                }

                CustomUserDetails userDetails = (CustomUserDetails) customUserDetailsService.loadUserByUsername(username);
                Authentication authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        authorities
                );

                var securityContext = SecurityContextHolder.getContext();
                if (securityContext.getAuthentication() == null) {
                    securityContext.setAuthentication(authToken);
                }
            } catch (Exception e) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}