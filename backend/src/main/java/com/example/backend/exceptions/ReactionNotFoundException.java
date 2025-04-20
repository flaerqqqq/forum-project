package com.example.backend.exceptions;

public class ReactionNotFoundException extends RuntimeException {

    public ReactionNotFoundException(String msg) {
        super(msg);
    }

    public ReactionNotFoundException() {
        super("Reaction not found exception");
    }

    @Override
    public String toString() {
        return "ReactionNotFoundException: " + getMessage();
    }
}