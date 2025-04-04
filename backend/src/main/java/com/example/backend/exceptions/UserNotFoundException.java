package com.example.backend.exceptions;

public class UserNotFoundException extends RuntimeException {
    
    public UserNotFoundException(String msg) {
        super(msg);
    }

    public UserNotFoundException() {
        super("User not found");
    }

    @Override
    public String toString() {
        return "UserNotFoundException: " + getMessage();
    }
}