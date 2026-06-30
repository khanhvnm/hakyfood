package org.example.hakyfoodbackend.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;

    /**
     * Creates a new AppException with the specified error code and detail message.
     *
     * @param errorCode: the error code (USER_NOT_FOUND)
     * @param detail: the detail message (id=123)
     * @return: "User not found: id=123"
     * */
    public AppException(ErrorCode errorCode, String detail) {
        super(errorCode.getMessage() + ": " + detail);
        this.errorCode = errorCode;
    }

}
