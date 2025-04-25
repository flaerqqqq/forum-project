package com.example.backend.exceptions;

public class UserNotCategoryModeratorException extends RuntimeException {

    public UserNotCategoryModeratorException(String msg) {
        super(msg);
    }

    public UserNotCategoryModeratorException() {
        super("User not a moderator of the category");
    }

    @Override
    public String toString() {
        return "UserNotCategoryModeratorException: " + getMessage();
    }
}