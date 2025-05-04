package com.example.backend.handlers;

import com.example.backend.exceptions.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        log.error("Internal server error: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.builder(ex, HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()).build());
    }

    @ExceptionHandler({
            UserNotFoundException.class,
            EmailConfirmTokenNotFoundException.class,
            RoleNotFoundException.class,
            ReportNotFoundException.class,
            ReactionNotFoundException.class,
            CategoryNotFoundException.class,
            CategoryFollowNotFoundException.class,
            PostImageNotFoundException.class,
            PostNotFoundException.class
    })
    public ResponseEntity<ErrorResponse> handleNotFoundException(RuntimeException ex) {
        log.warn("Not found: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.builder(ex, HttpStatus.NOT_FOUND, ex.getMessage()).build());
    }

    @ExceptionHandler({
            UserAlreadyExistsException.class,
            CategoryAlreadyExistsException.class,
            UserAlreadyFollowsCategoryException.class,
            UserNotCategoryOwnerException.class,
            UserAlreadyCategoryModeratorException.class,
            UserNotCategoryModeratorException.class,
            CannotRemoveYourselfAsOwnerException.class
    })
    public ResponseEntity<ErrorResponse> handleAlreadyExistsException(RuntimeException ex) {
        log.warn("Already exists: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ErrorResponse.builder(ex, HttpStatus.CONFLICT, ex.getMessage()).build());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentialsException(InvalidCredentialsException ex) {
        log.warn("Invalid credentials: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.builder(ex, HttpStatus.UNAUTHORIZED, ex.getMessage()).build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (var errorObject : ex.getBindingResult().getAllErrors()) {
            if (errorObject instanceof FieldError) {
                FieldError fieldError = (FieldError) errorObject;
                errors.put(fieldError.getField(), fieldError.getDefaultMessage());
            } else {
                errors.put("Error", errorObject.getDefaultMessage());
            }
        }
        log.warn("Validation error: {}", errors);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder(ex, HttpStatus.BAD_REQUEST, errors.toString()).build());
    }

    @ExceptionHandler({
            ImageValidationException.class,
            InappropriateReactionTypeException.class,
            SimilarReportException.class,
            UserEmailNotVerifiedException.class,
            UserNotFollowCategoryException.class
    })
    public ResponseEntity<ErrorResponse> handleBadRequestException(RuntimeException ex) {
        log.warn("Bad request exception: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder(ex, HttpStatus.BAD_REQUEST, ex.getMessage()).build());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxSizeException(MaxUploadSizeExceededException ex) {
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ErrorResponse.builder(ex, HttpStatus.BAD_REQUEST, ex.getMessage()).build());
    }
}