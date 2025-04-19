package com.example.backend.exceptions;

public class ReportNotFoundException extends RuntimeException {

    public ReportNotFoundException(String msg) {
        super(msg);
    }

    public ReportNotFoundException() {
        super("Report not found");
    }

    @Override
    public String toString() {
        return "ReportNotFoundException: " + getMessage();
    }
}