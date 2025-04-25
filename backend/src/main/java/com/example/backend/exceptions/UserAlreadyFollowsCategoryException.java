package com.example.backend.exceptions;

public class UserAlreadyFollowsCategoryException extends RuntimeException {

    public UserAlreadyFollowsCategoryException(String msg) {
        super(msg);
    }

    public UserAlreadyFollowsCategoryException() {
        super("User already follows a category");
    }

    @Override
    public String toString() {
        return "UserAlreadyFollowsCategoryException: " + getMessage();
    }
}