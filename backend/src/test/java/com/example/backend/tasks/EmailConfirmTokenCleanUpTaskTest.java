package com.example.backend.tasks;

import com.example.backend.models.EmailConfirmToken;
import com.example.backend.models.User;
import com.example.backend.repositories.EmailConfirmTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.*;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailConfirmTokenCleanUpTaskTest {

    @Mock
    EmailConfirmTokenRepository tokenRepository;

    @InjectMocks
    EmailConfirmTokenCleanUpTask tokenCleanUpTask;

    @BeforeEach
    void setUp() {
        tokenCleanUpTask = new EmailConfirmTokenCleanUpTask(tokenRepository);
    }

    @Test
    void cleanUpTokens_shouldDeleteTokens_whenExpired() {
        EmailConfirmToken expiredToken = new EmailConfirmToken();
        expiredToken.setExpireAt(new Date(System.currentTimeMillis() - 1000));

        Page<EmailConfirmToken> page = new PageImpl<>(Collections.singletonList(expiredToken));
        when(tokenRepository.findAll(any(Pageable.class)))
                .thenReturn(page)
                .thenReturn(Page.empty());

        tokenCleanUpTask.cleanUpTokens();

        verify(tokenRepository, times(1)).deleteAll(Collections.singletonList(expiredToken));
    }

    @Test
    void cleanUpTokens_shouldDeleteTokens_whenUserEmailVerified() {
        User user = new User();
        user.setIsEmailVerified(true);

        EmailConfirmToken token = new EmailConfirmToken();
        token.setExpireAt(new Date(System.currentTimeMillis() + 100000));
        token.setUser(user);

        Page<EmailConfirmToken> page = new PageImpl<>(Collections.singletonList(token));
        when(tokenRepository.findAll(any(PageRequest.class)))
                .thenReturn(page)
                .thenReturn(Page.empty());

        tokenCleanUpTask.cleanUpTokens();

        verify(tokenRepository, times(1)).deleteAll(List.of(token));
    }

    @Test
    void cleanUpTokens_shouldNotDeleteTokens_whenUserEmailNotVerifiedAndTokenNotExpired() {
        User user = new User();
        user.setIsEmailVerified(false);

        EmailConfirmToken token = new EmailConfirmToken();
        token.setExpireAt(new Date(System.currentTimeMillis() + 100000));
        token.setUser(user);

        Page<EmailConfirmToken> page = new PageImpl<>(Collections.singletonList(token));
        when(tokenRepository.findAll(any(Pageable.class)))
                .thenReturn(page)
                .thenReturn(Page.empty());

        tokenCleanUpTask.cleanUpTokens();

        verify(tokenRepository, times(0)).deleteAll(Collections.singletonList(token));
    }
}