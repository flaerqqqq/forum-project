package com.example.backend.exceptions;

public class CannotRemoveYourselfAsOwnerException extends RuntimeException {

    public CannotRemoveYourselfAsOwnerException(String msg) {
        super(msg);
    }

    public CannotRemoveYourselfAsOwnerException() {
        super("Cannot remove yourself as the owner of ther category");
    }

    @Override
    public String toString() {
        return "CannotRemoveYourselfAsOwnerException: " + getMessage();
    }
}