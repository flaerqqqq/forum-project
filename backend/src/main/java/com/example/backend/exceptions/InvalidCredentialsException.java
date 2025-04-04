package com.example.backend.exceptions;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String msg) {
        super(msg);
    }

    public InvalidCredentialsException() {
        super("Invalid credentials");
    }

    @Override
    public String toString() {
        return "InvalidCredentialsException: " + getMessage();
    }
}