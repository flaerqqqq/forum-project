package com.example.backend.security;

import com.example.backend.exceptions.UserEmailNotVerifiedException;
import com.example.backend.models.User;
import com.example.backend.models.UserBanData;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username).orElseThrow(() ->
                new UsernameNotFoundException(username));

        if (!user.getIsEmailVerified()) {
            throw new UserEmailNotVerifiedException();
        }

        Optional<UserBanData> userBanDataOpt = user.getUserBanData().stream()
                .filter(banData -> !banData.getIsCategoryBan())
                .findAny();
        if (userBanDataOpt.isPresent()) {
            UserBanData userBanData = userBanDataOpt.get();
            String errorMessage = STR."Cannot login, banned until \{userBanData.getIsPermanentBan() ? "{forever}" : userBanData.getUnbanAt()} for '\{userBanData.getReason()}'";
            if (userBanData.getIsPermanentBan()) {
                errorMessage = STR."Cannot login, user has a permanent ban for '\{userBanData.getReason()}'";
            }
            throw new AccessDeniedException(errorMessage);
        }

        return new CustomUserDetails(user);
    }
}