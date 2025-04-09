package com.example.backend.services;

import com.example.backend.models.User;

public interface EmailConfirmService {

    void initiateConfirmation(User user);

    void confirm(String token);
}