package com.example.backend.exceptions;

public class SimilarReportException extends RuntimeException {
    public SimilarReportException(String msg) {
        super(msg);
    }

    public SimilarReportException() {
        super("Such a report already exists");
    }

    @Override
    public String toString() {
        return "SimilarReportException: " + getMessage();
    }
}