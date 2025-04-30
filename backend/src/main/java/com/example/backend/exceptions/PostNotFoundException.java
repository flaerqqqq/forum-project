package com.example.backend.exceptions;

public class PostNotFoundException extends RuntimeException {

    public PostNotFoundException(String msg) {
        super(msg);
    }

    public PostNotFoundException() {
        super("Post not found");
    }

    @Override
    public String toString() {
        return "PostNotFoundException: " + getMessage();
    }

}