package com.example.backend.exceptions;

public class RoleNotFoundException extends RuntimeException {

    public RoleNotFoundException(String msg) {
        super(msg);
    }

    public RoleNotFoundException() {
        super("Role is not found");
    }

    @Override
    public String toString() {
        return "RoleNotFoundException: " + getMessage();
    }

}