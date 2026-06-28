package org.example.hakyfoodbackend.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.example.hakyfoodbackend.common.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> handleAppException(
            AppException ex,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(ex.getErrorCode().getHttpStatus())
                .body(ApiResponse.error(ex.getErrorCode(), request));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String fieldName = error.getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return ResponseEntity
                .status(ErrorCode.VALIDATION_FAILED.getHttpStatus())
                .body(ApiResponse.error(ErrorCode.VALIDATION_FAILED, errors, request));
    }

}
