package org.example.hakyfoodbackend.modules.auth.service;

import lombok.RequiredArgsConstructor;
import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.modules.auth.enums.VerificationPurpose;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final String HASH_KEY_CODE = "code";
    private static final String HASH_KEY_ATTEMPTS = "attempts";
    private static final int OTP_TTL_SECONDS = 180; // 3 minutes
    private static final int MAX_ATTEMPTS = 5;

    private final StringRedisTemplate stringRedisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * GENERATE AND SAVE OTP
     * 1. Check cooldown (to prevent sending OTP too quickly within 60 seconds).
     * 2. Generate a random OTP of 6 digits.
     * 3. Store the OTP and attempts (attempts = 0) in Redis as a Hash.
     * 4. Set the expiration time for the OTP (180 seconds).
     */
    public String generateAndSaveOtp(UUID userId, VerificationPurpose purpose) {
        String otpKey = generateOtpKey(userId, purpose);
        String otpCooldownKey = generateOtpCooldownKey(userId, purpose);

        Boolean cooldownExists = stringRedisTemplate.opsForValue()
                .setIfAbsent(otpCooldownKey, "1", Duration.ofSeconds(60));

        if (!Boolean.TRUE.equals(cooldownExists)) {
            throw new AppException(ErrorCode.OTP_RESEND_TOO_FREQUENTLY);
        }

        String code = String.format("%06d", secureRandom.nextInt(1000000));

        Map<String, String> hash = Map.of(
                HASH_KEY_CODE, code,
                HASH_KEY_ATTEMPTS, "0");
        stringRedisTemplate.opsForHash().putAll(otpKey, hash);
        stringRedisTemplate.expire(otpKey, Duration.ofSeconds(OTP_TTL_SECONDS));

        return code;
    }

    /**
     * VERIFY OTP
     * 1. Check existence and fail-fast if already exceeded max attempts.
     * 2. Increment attempts on mismatch (deletes OTP immediately if limit is reached).
     * 3. Delete this OTP key on success to prevent replay attacks.
     */
    public void verifyOtp(UUID userId, VerificationPurpose purpose, String userInputCode) {
        String otpKey = generateOtpKey(userId, purpose);

        HashOperations<String, String, String> hashOperations = stringRedisTemplate.opsForHash();
        List<String> values = hashOperations.multiGet(otpKey, List.of(HASH_KEY_CODE, HASH_KEY_ATTEMPTS));

        if (values == null || values.isEmpty()) {
            throw new AppException(ErrorCode.OTP_NOT_FOUND);
        }

        String storedCode = values.get(0);
        if (storedCode == null) {
            throw new AppException(ErrorCode.OTP_NOT_FOUND);
        }

        String attemptsString = values.get(1);
        int attempts = attemptsString != null ? Integer.parseInt(attemptsString) : 0;
        if (attempts >= MAX_ATTEMPTS) {
            stringRedisTemplate.delete(otpKey);
            throw new AppException(ErrorCode.OTP_MAX_ATTEMPTS);
        }

        if (!storedCode.equals(userInputCode)) {
            Long currentAttempts = hashOperations.increment(otpKey, HASH_KEY_ATTEMPTS, 1);

            if (currentAttempts != null && currentAttempts >= MAX_ATTEMPTS) {
                stringRedisTemplate.delete(otpKey);
                throw new AppException(ErrorCode.OTP_MAX_ATTEMPTS);
            }

            throw new AppException(ErrorCode.OTP_INCORRECT);
        }

        stringRedisTemplate.delete(otpKey);
    }

    /*** Internal helper methods ***/
    private String generateOtpKey(UUID userId, VerificationPurpose purpose) {
        return String.format("auth:otp:%s:user:%s", purpose.name().toLowerCase(), userId.toString());
    }

    private String generateOtpCooldownKey(UUID userId, VerificationPurpose purpose) {
        return String.format("auth:otp:cooldown:%s:user:%s", purpose.name().toLowerCase(), userId.toString());
    }

}
