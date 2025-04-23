package com.example.backend.exceptions;

public class CategoryAlreadyExistsException extends RuntimeException {

    public CategoryAlreadyExistsException(String msg) {
        super(msg);
    }

    public CategoryAlreadyExistsException() {
        super("Category already exists");
    }

    @Override
    public String toString() {
        return "CategoryAlreadyExistsException: " + getMessage();
    }
}