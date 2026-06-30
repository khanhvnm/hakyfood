package org.example.hakyfoodbackend.module.auth.service;

import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.modules.auth.enums.VerificationPurpose;
import org.example.hakyfoodbackend.modules.auth.service.OtpService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OtpServiceTest {

    private static final UUID USER_ID = UUID.fromString("019f02d8-b2f5-7932-b905-7e3a3b860cb7");
    private static final VerificationPurpose PURPOSE = VerificationPurpose.REGISTER;
    private static final String OTP_KEY = "auth:otp:register:user:" + USER_ID;
    private static final String COOLDOWN_KEY = "auth:otp:cooldown:register:user:" + USER_ID;

    @Mock
    private StringRedisTemplate stringRedisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private HashOperations<String, String, String> hashOperations;

    @InjectMocks
    private OtpService otpService;

    // ==================== GENERATE AND SAVE OTP ====================

    @Test
    void shouldGenerateAndSaveOtpSuccessfully() {
        // Arrange
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(eq(COOLDOWN_KEY), eq("1"), eq(Duration.ofSeconds(60))))
                .thenReturn(true);
        doReturn(hashOperations).when(stringRedisTemplate).opsForHash();

        // Act
        String code = otpService.generateAndSaveOtp(USER_ID, PURPOSE);

        // Assert
        assertNotNull(code);
        assertEquals(6, code.length());
        assertTrue(code.matches("\\d{6}"));

        verify(hashOperations).putAll(eq(OTP_KEY), anyMap());
        verify(stringRedisTemplate).expire(eq(OTP_KEY), eq(Duration.ofSeconds(180)));
    }

    @Test
    void shouldThrowOtpResendTooFrequentlyWhenCooldownExists() {
        // Arrange
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(eq(COOLDOWN_KEY), eq("1"), eq(Duration.ofSeconds(60))))
                .thenReturn(false);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> otpService.generateAndSaveOtp(USER_ID, PURPOSE));

        assertEquals(ErrorCode.OTP_RESEND_TOO_FREQUENTLY, exception.getErrorCode());
        verify(stringRedisTemplate, never()).opsForHash();
    }

    // ==================== VERIFY OTP ====================

    @Test
    void shouldThrowOtpNotFoundWhenOtpDataIsNull() {
        // Arrange
        doReturn(hashOperations).when(stringRedisTemplate).opsForHash();
        when(hashOperations.multiGet(eq(OTP_KEY), eq(List.of("code", "attempts"))))
                .thenReturn(null);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> otpService.verifyOtp(USER_ID, PURPOSE, "123456"));

        assertEquals(ErrorCode.OTP_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void shouldThrowOtpNotFoundWhenOtpDataIsEmpty() {
        // Arrange
        doReturn(hashOperations).when(stringRedisTemplate).opsForHash();
        when(hashOperations.multiGet(eq(OTP_KEY), eq(List.of("code", "attempts"))))
                .thenReturn(Collections.emptyList());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> otpService.verifyOtp(USER_ID, PURPOSE, "123456"));

        assertEquals(ErrorCode.OTP_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void shouldThrowOtpNotFoundWhenStoredCodeIsNull() {
        // Arrange
        doReturn(hashOperations).when(stringRedisTemplate).opsForHash();
        when(hashOperations.multiGet(eq(OTP_KEY), eq(List.of("code", "attempts"))))
                .thenReturn(Arrays.asList(null, "0"));

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> otpService.verifyOtp(USER_ID, PURPOSE, "123456"));

        assertEquals(ErrorCode.OTP_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void shouldDeleteOtpAndThrowExceptionWhenMaxAttemptsReached() {
        // Arrange: attempts đã đạt 5 từ trước (fail-fast path)
        doReturn(hashOperations).when(stringRedisTemplate).opsForHash();
        when(hashOperations.multiGet(eq(OTP_KEY), eq(List.of("code", "attempts"))))
                .thenReturn(Arrays.asList("123456", "5"));

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> otpService.verifyOtp(USER_ID, PURPOSE, "123456"));

        assertEquals(ErrorCode.OTP_MAX_ATTEMPTS, exception.getErrorCode());
        verify(stringRedisTemplate).delete(OTP_KEY);
    }

    @Test
    void shouldIncreaseAttemptsAndThrowExceptionWhenOtpIncorrect() {
        // Arrange: OTP sai, attempts hiện tại = 2 -> sau increment = 3 (chưa đạt max)
        doReturn(hashOperations).when(stringRedisTemplate).opsForHash();
        when(hashOperations.multiGet(eq(OTP_KEY), eq(List.of("code", "attempts"))))
                .thenReturn(Arrays.asList("123456", "2"));
        when(hashOperations.increment(OTP_KEY, "attempts", 1)).thenReturn(3L);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> otpService.verifyOtp(USER_ID, PURPOSE, "999999"));

        assertEquals(ErrorCode.OTP_INCORRECT, exception.getErrorCode());
        verify(hashOperations).increment(OTP_KEY, "attempts", 1);
        verify(stringRedisTemplate, never()).delete(OTP_KEY);
    }

    @Test
    void shouldDeleteOtpAndThrowMaxAttemptsWhenFifthIncorrectAttempt() {
        // Arrange: OTP sai, attempts hiện tại = 4 -> sau increment = 5 (đạt max, xóa OTP ngay)
        doReturn(hashOperations).when(stringRedisTemplate).opsForHash();
        when(hashOperations.multiGet(eq(OTP_KEY), eq(List.of("code", "attempts"))))
                .thenReturn(Arrays.asList("123456", "4"));
        when(hashOperations.increment(OTP_KEY, "attempts", 1)).thenReturn(5L);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> otpService.verifyOtp(USER_ID, PURPOSE, "999999"));

        assertEquals(ErrorCode.OTP_MAX_ATTEMPTS, exception.getErrorCode());
        verify(stringRedisTemplate).delete(OTP_KEY);
    }

    @Test
    void shouldDeleteOtpWhenOtpVerifiedSuccessfully() {
        // Arrange
        doReturn(hashOperations).when(stringRedisTemplate).opsForHash();
        when(hashOperations.multiGet(eq(OTP_KEY), eq(List.of("code", "attempts"))))
                .thenReturn(Arrays.asList("123456", "0"));

        // Act
        otpService.verifyOtp(USER_ID, PURPOSE, "123456");

        // Assert: OTP key phải được xóa sau khi verify thành công
        verify(stringRedisTemplate).delete(OTP_KEY);
        // Không được gọi increment vì OTP đúng ngay
        verify(hashOperations, never()).increment(anyString(), anyString(), anyLong());
    }

    @Test
    void shouldTreatAttemptsAsZeroWhenAttemptsIsNull() {
        // Arrange: attempts = null trong Redis, OTP đúng -> vẫn verify thành công
        doReturn(hashOperations).when(stringRedisTemplate).opsForHash();
        when(hashOperations.multiGet(eq(OTP_KEY), eq(List.of("code", "attempts"))))
                .thenReturn(Arrays.asList("123456", null));

        // Act: không throw exception vì attempts = 0 < 5 và OTP đúng
        otpService.verifyOtp(USER_ID, PURPOSE, "123456");

        // Assert
        verify(stringRedisTemplate).delete(OTP_KEY);
    }

    @Test
    void shouldThrowOtpIncorrectWhenCurrentAttemptsIsNull() {
        // Arrange: OTP sai, attempts = 2 -> increment trả về null
        doReturn(hashOperations).when(stringRedisTemplate).opsForHash();
        when(hashOperations.multiGet(eq(OTP_KEY), eq(List.of("code", "attempts"))))
                .thenReturn(Arrays.asList("123456", "2"));
        when(hashOperations.increment(OTP_KEY, "attempts", 1)).thenReturn(null);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> otpService.verifyOtp(USER_ID, PURPOSE, "999999"));

        assertEquals(ErrorCode.OTP_INCORRECT, exception.getErrorCode());
        verify(hashOperations).increment(OTP_KEY, "attempts", 1);
        verify(stringRedisTemplate, never()).delete(OTP_KEY);
    }

}

