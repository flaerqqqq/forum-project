package com.example.backend.exceptions;

public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException(String msg) {
        super(msg);
    }

    public UserAlreadyExistsException() {
        super("User already exists");
    }

    @Override
    public String toString() {
        return "UserAlreadyExistsException: " + getMessage();
    }
}