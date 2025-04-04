package com.example.backend.services.impls;

import com.example.backend.exceptions.JwtValidationException;
import com.example.backend.services.JwtService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class JwtServiceImpl implements JwtService {

    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey key;

    public JwtServiceImpl(@Value("${jwt.secret}") String secret) {
        key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public String generate(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities());
        Date issuedAt = new Date();
        Date expiredAt = new Date(issuedAt.getTime() + expiration);
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(issuedAt)
                .setExpiration(expiredAt)
                .setIssuer(userDetails.getUsername())
                .signWith(key)
                .compact();
    }

    @Override
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    @Override
    public List<GrantedAuthority> extractAuthorities(String token) {
        return ((List<Map<String, String>>)extractClaims(token).get("roles")).get(0).values().stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    @Override
    public void validate(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
        } catch (ExpiredJwtException e) {
            throw new JwtValidationException("Token has expired", e);
        } catch (UnsupportedJwtException e) {
            throw new JwtValidationException("Unsupported JWT token", e);
        } catch (MalformedJwtException e) {
            throw new JwtValidationException("Malformed JWT token", e);
        } catch (SignatureException e) {
            throw new JwtValidationException("Invalid JWT signature", e);
        } catch (IllegalArgumentException e) {
            throw new JwtValidationException("JWT token compact of handler are invalid", e);
        }        }

    private Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}