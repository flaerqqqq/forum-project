package com.example.backend.exceptions;

public class JwtValidationException extends RuntimeException {

    public JwtValidationException(String msg, Throwable throwable) {
        super(msg, throwable);
    }
}