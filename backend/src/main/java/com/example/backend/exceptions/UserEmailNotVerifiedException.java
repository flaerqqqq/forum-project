package com.example.backend.exceptions;

public class UserEmailNotVerifiedException extends RuntimeException {

    public UserEmailNotVerifiedException(String msg) {
        super(msg);
    }

    public UserEmailNotVerifiedException() {
        super("User did not verified its email");
    }

    @Override
    public String toString() {
        return "UserEmailNotVerifiedException: " + getMessage();
    }
}