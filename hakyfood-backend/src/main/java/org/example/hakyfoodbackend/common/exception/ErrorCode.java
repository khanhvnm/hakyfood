package org.example.hakyfoodbackend.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    REGISTER_FAILED(HttpStatus.BAD_REQUEST, "register.failed"),

    ACCOUNT_EXISTS(HttpStatus.BAD_REQUEST, "account.exists"),

    OTP_RESEND_TOO_FREQUENTLY(HttpStatus.BAD_REQUEST, "otp.resend_too_frequently"),
    OTP_NOT_FOUND(HttpStatus.BAD_REQUEST, "otp.not_found"),
    OTP_MAX_ATTEMPTS(HttpStatus.BAD_REQUEST, "otp.max_attempts"),
    OTP_INCORRECT(HttpStatus.BAD_REQUEST, "otp.incorrect"),

    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "validation.failed")

    ;

    private final HttpStatus httpStatus;
    private final String message;

}
