package com.example.backend.exceptions;

public class PostImageNotFoundException extends RuntimeException {

    public PostImageNotFoundException(String msg) {
        super(msg);
    }

    public PostImageNotFoundException() {
        super("Post image not found");
    }

    @Override
    public String toString() {
        return "PostImageNotFoundException: " + getMessage();
    }
}