package com.example.backend.exceptions;

public class CategoryNotFoundException extends RuntimeException {

    public CategoryNotFoundException(String msg) {
        super(msg);
    }

    public CategoryNotFoundException() {
        super("Category not found");
    }

    @Override
    public String toString() {
        return "CategoryNotFoundException: " + getMessage();
    }
}