package org.example.hakyfoodbackend.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    ACCOUNT_EXISTS(HttpStatus.BAD_REQUEST, "account.exists"),
    ACCOUNT_NOT_PENDING_VERIFY(HttpStatus.BAD_REQUEST, "account.not_pending_verify"),
    ACCOUNT_NOT_ACTIVE(HttpStatus.FORBIDDEN, "account.not_active"),

    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "auth.invalid_credentials"),

    OTP_RESEND_TOO_FREQUENTLY(HttpStatus.BAD_REQUEST, "otp.resend_too_frequently"),
    OTP_NOT_FOUND(HttpStatus.BAD_REQUEST, "otp.not_found"),
    OTP_MAX_ATTEMPTS(HttpStatus.BAD_REQUEST, "otp.max_attempts"),
    OTP_INCORRECT(HttpStatus.BAD_REQUEST, "otp.incorrect"),
    OTP_VERIFICATION_FAILED(HttpStatus.BAD_REQUEST, "otp.verification_failed"),

    AUTH_FLOW_SESSION_EXPIRED(HttpStatus.BAD_REQUEST, "auth_flow_session.expired"),

    INVALID_VERIFICATION_PURPOSE(HttpStatus.BAD_REQUEST, "invalid_verification_purpose"),

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "user.not_found"),
    ROLE_NOT_FOUND(HttpStatus.NOT_FOUND, "role.not_found"),

    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "category.not_found"),
    CATEGORY_SLUG_EXISTS(HttpStatus.BAD_REQUEST, "category.slug_exists"),
    CATEGORY_CIRCULAR_REFERENCE(HttpStatus.BAD_REQUEST, "category.circular_reference"),

    OPTION_GROUP_NOT_FOUND(HttpStatus.NOT_FOUND, "option_group.not_found"),
    OPTION_GROUP_INVALID_CONSTRAINTS(HttpStatus.BAD_REQUEST, "option_group.invalid_constraints"),
    OPTION_GROUP_SLUG_EXISTS(HttpStatus.BAD_REQUEST, "option_group.slug_exists"),

    FOOD_NOT_FOUND(HttpStatus.NOT_FOUND, "food.not_found"),
    FOOD_SLUG_EXISTS(HttpStatus.BAD_REQUEST, "food.slug_exists"),

    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "validation.failed"),

    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Unauthorized"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Forbidden")

    ;

    private final HttpStatus httpStatus;
    private final String message;

}
