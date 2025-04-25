package com.example.backend.exceptions;

public class UserNotCategoryOwnerException extends RuntimeException{

    public UserNotCategoryOwnerException(String msg) {
        super(msg);
    }

    public UserNotCategoryOwnerException() {
        super("User not a category owner");
    }

    @Override
    public String toString() {
        return "UserNotCategoryOwnerException: " + getMessage();
    }
}