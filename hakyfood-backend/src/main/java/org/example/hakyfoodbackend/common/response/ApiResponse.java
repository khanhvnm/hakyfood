package org.example.hakyfoodbackend.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Builder;
import org.example.hakyfoodbackend.common.exception.ErrorCode;

import java.time.Instant;
import java.util.Map;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse <T> {

    private boolean success;
    private T data;
    private String errorCode;
    private String message;
    private Map<String, String> errors;
    private String path;
    private Instant timestamp;

    /**
     * Creates a successful API response.
     *
     * @param data: response payload
     * @param request: current HTTP request
     * */
    public static <T> ApiResponse<T> success(T data, HttpServletRequest request) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();
    }

    /**
     * Creates an error response without field validation errors.
     *
     * @param errorCode: predefined error code
     * @param request: the HTTP request
     * */
    public static <T> ApiResponse<T> error(ErrorCode errorCode, HttpServletRequest request) {
        return ApiResponse.<T>builder()
                .success(false)
                .errorCode(errorCode.name())
                .message(errorCode.getMessage())
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();
    }

    /**
     * Creates an error response containing field validation errors.
     *
     * @param errorCode: predefined error code
     * @param errors: map of field names to error messages
     * @param request: the HTTP request
     * */
    public static <T> ApiResponse<T> error(
            ErrorCode errorCode,
            Map<String, String> errors,
            HttpServletRequest request
    ) {
        return ApiResponse.<T>builder()
                .success(false)
                .errorCode(errorCode.name())
                .message(errorCode.getMessage())
                .errors(errors)
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();
    }

}
