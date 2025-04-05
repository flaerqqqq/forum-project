package com.example.backend.services.impls;

import com.example.backend.exceptions.EmailConfirmTokenNotFoundException;
import com.example.backend.models.EmailConfirmToken;
import com.example.backend.models.User;
import com.example.backend.repositories.EmailConfirmTokenRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.EmailConfirmService;
import com.example.backend.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailConfirmServiceImpl implements EmailConfirmService {

    private final EmailConfirmTokenRepository emailConfirmTokenRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Override
    public void initiateConfirmation(User user) {
        EmailConfirmToken token = EmailConfirmToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .build();

        emailConfirmTokenRepository.save(token);

        emailService.sendConfirmEmail(user.getEmail(), token.getToken());
    }

    @Override
    public void confirm(String token) {
        EmailConfirmToken emailConfirmToken = emailConfirmTokenRepository.findByToken(token).orElseThrow(() ->
                new EmailConfirmTokenNotFoundException(
                        "Such email confirmation token=%s is not founds".formatted(token)));

        User user = emailConfirmToken.getUser();
        user.setIsEmailVerified(true);
        userRepository.save(user);
    }
}