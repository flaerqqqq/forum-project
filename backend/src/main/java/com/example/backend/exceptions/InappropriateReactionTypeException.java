package com.example.backend.exceptions;

public class InappropriateReactionTypeException extends RuntimeException {

    public InappropriateReactionTypeException(String msg) {
        super(msg);
    }

    public InappropriateReactionTypeException() {
        super("Inappropriate reaction type");
    }

    @Override
    public String toString() {
        return "InappropriateReactionTypeException: " + getMessage();
    }
}