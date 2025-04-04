package com.example.backend.services.impls;

import com.example.backend.models.EmailConfirmToken;
import com.example.backend.models.User;
import com.example.backend.repositories.EmailConfirmRepository;
import com.example.backend.services.EmailConfirmService;
import com.example.backend.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailConfirmServiceImpl implements EmailConfirmService {

    private final EmailConfirmRepository emailConfirmRepository;
    private final EmailService emailService;

    @Override
    public void initiateConfirmation(User user) {
        EmailConfirmToken token = EmailConfirmToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .build();

        emailConfirmRepository.save(token);

        emailService.sendConfirmEmail(user.getEmail(), token.getToken());
    }
}