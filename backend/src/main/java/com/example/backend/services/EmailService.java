package com.example.backend.services;

public interface EmailService {

    void sendConfirmEmail(String receiverEmail, String token);
}