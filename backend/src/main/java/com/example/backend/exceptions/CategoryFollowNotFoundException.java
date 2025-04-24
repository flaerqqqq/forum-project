package com.example.backend.exceptions;

public class CategoryFollowNotFoundException extends RuntimeException{

    public CategoryFollowNotFoundException(String msg) {
        super(msg);
    }

    public CategoryFollowNotFoundException() {
        super("Category follow is not found");
    }

    @Override
    public String toString() {
        return "CategoryFollowNotFoundException: " + getMessage();
    }
}