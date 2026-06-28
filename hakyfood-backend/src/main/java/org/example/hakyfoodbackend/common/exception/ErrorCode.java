package org.example.hakyfoodbackend.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "validation.failed")

    ;

    private final HttpStatus httpStatus;
    private final String message;

}
