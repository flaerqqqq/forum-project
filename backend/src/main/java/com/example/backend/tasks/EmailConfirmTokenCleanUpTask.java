package com.example.backend.tasks;

import com.example.backend.models.EmailConfirmToken;
import com.example.backend.repositories.EmailConfirmTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EmailConfirmTokenCleanUpTask {

    private final EmailConfirmTokenRepository tokenRepository;

    @Scheduled(fixedRate = 6000)
    @Transactional
    public void cleanUpTokens() {
        int batchSize = 10000;
        int page = 0;
        boolean hasMore = true;

        while (hasMore) {
            Page<EmailConfirmToken> expiredTokens = tokenRepository.findAll(PageRequest.of(page++, batchSize));
            hasMore = !expiredTokens.isEmpty();

            List<EmailConfirmToken> toBeDeleted = expiredTokens.stream()
                    .filter(token -> token.getExpireAt().before(new Date())
                            || token.getUser().getIsEmailVerified())
                    .toList();

            tokenRepository.deleteAll(toBeDeleted);
        }
    }
}