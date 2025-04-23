package com.example.backend.exceptions;

public class S3UploadException extends RuntimeException {

    public S3UploadException(String msg) {
        super(msg);
    }

    public S3UploadException(Throwable throwable) {
        super(throwable);
    }

    public S3UploadException() {
        super("Error while uploading a file to S3");
    }

    @Override
    public String toString() {
        return "S3UploadException: " + getMessage();
    }
}