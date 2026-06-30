package org.example.hakyfoodbackend.modules.auth.enums;

import lombok.extern.slf4j.Slf4j;
import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;

@Slf4j
public enum VerificationPurpose {
    REGISTER,
    FORGOT_PASSWORD;

    public static VerificationPurpose fromString(String purpose) {
        try {
            return VerificationPurpose.valueOf(purpose.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.error("Verification purpose {} not found: {}", purpose, e.getMessage());
            throw new AppException(ErrorCode.INVALID_VERIFICATION_PURPOSE);
        }
    }
}
