package com.example.backend.exceptions;

public class UserAlreadyCategoryModeratorException extends RuntimeException {
    public UserAlreadyCategoryModeratorException(String msg) {
        super(msg);
    }

    public UserAlreadyCategoryModeratorException() {
        super("User already a moderator in the category");
    }

    @Override
    public String toString() {
        return "UserAlreadyCategoryModeratorException: " + getMessage();
    }
}