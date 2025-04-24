package com.example.backend.exceptions;

public class UserNotFollowCategoryException extends RuntimeException{

    public UserNotFollowCategoryException(String msg) {
        super(msg);
    }

    public UserNotFollowCategoryException() {
        super("User not following a category");
    }

    @Override
    public String toString() {
        return "UserNotFollowCategoryException: " + getMessage();
    }
}