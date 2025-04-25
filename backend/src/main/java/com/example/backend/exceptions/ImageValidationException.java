package com.example.backend.exceptions;

public class ImageValidationException extends RuntimeException {

    public ImageValidationException(String msg) {
        super(msg);
    }

    public ImageValidationException(Throwable throwable) {
        super(throwable);
    }
    public ImageValidationException() {
        super("Invalid content type");
    }

    @Override
    public String toString() {
        return "ImageValidationException: " + getMessage();
    }
}