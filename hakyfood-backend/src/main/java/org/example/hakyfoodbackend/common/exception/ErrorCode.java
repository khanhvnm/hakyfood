package org.example.hakyfoodbackend.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    ACCOUNT_EXISTS(HttpStatus.BAD_REQUEST, "account.exists"),
    ACCOUNT_NOT_PENDING_VERIFY(HttpStatus.BAD_REQUEST, "account.not_pending_verify"),

    OTP_RESEND_TOO_FREQUENTLY(HttpStatus.BAD_REQUEST, "otp.resend_too_frequently"),
    OTP_NOT_FOUND(HttpStatus.BAD_REQUEST, "otp.not_found"),
    OTP_MAX_ATTEMPTS(HttpStatus.BAD_REQUEST, "otp.max_attempts"),
    OTP_INCORRECT(HttpStatus.BAD_REQUEST, "otp.incorrect"),
    OTP_VERIFICATION_FAILED(HttpStatus.BAD_REQUEST, "otp.verification_failed"),

    AUTH_FLOW_SESSION_EXPIRED(HttpStatus.BAD_REQUEST, "auth_flow_session.expired"),

    INVALID_VERIFICATION_PURPOSE(HttpStatus.BAD_REQUEST, "invalid_verification_purpose"),

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "user.not_found"),
    ROLE_NOT_FOUND(HttpStatus.NOT_FOUND, "role.not_found"),

    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "validation.failed"),

    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Unauthorized"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Forbidden")

    ;

    private final HttpStatus httpStatus;
    private final String message;

}
