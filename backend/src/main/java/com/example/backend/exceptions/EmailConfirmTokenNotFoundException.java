package com.example.backend.exceptions;

public class EmailConfirmTokenNotFoundException extends RuntimeException {

    public EmailConfirmTokenNotFoundException(String msg) {
        super(msg);
    }

    public EmailConfirmTokenNotFoundException() {
        super("Email confirmation token is not found");
    }

    @Override
    public String toString() {
        return "EmailConfirmTokenNotFoundException: " + getMessage();
    }
}