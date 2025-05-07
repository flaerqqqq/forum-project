package com.example.backend.exceptions;

public class CommentaryNotFoundException extends RuntimeException {
    public CommentaryNotFoundException(String message) {
        super(message);
    }

    public CommentaryNotFoundException() {
        super("Commentary not found exception");
    }

    @Override
    public String toString() {
        return "CommentaryNotFound: " + getMessage();
    }
}