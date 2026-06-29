package org.example.hakyfoodbackend.module.auth.service;

import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.modules.auth.dto.AuthSessionData;
import org.example.hakyfoodbackend.modules.auth.enums.AuthFlowState;
import org.example.hakyfoodbackend.modules.auth.enums.VerificationPurpose;
import org.example.hakyfoodbackend.modules.auth.service.AuthFlowService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthFlowServiceTest {

    private static final String KEY_PREFIX = "auth:flow:";
    private static final String HASH_KEY_USER_ID = "userId";
    private static final String HASH_KEY_PURPOSE = "purpose";
    private static final String HASH_KEY_NEXT_STATE = "nextState";

    @Mock
    private StringRedisTemplate stringRedisTemplate;

    @Mock
    private HashOperations<String, Object, Object> hashOperations;

    @InjectMocks
    private AuthFlowService authFlowService;

    @Test
    void shouldCreateSessionSuccessfully() {
        // Arrange
        UUID userId = UUID.randomUUID();
        VerificationPurpose purpose = VerificationPurpose.REGISTER;
        AuthFlowState nextState = AuthFlowState.VERIFY_OTP;

        doReturn(hashOperations).when(stringRedisTemplate).opsForHash();

        // Act
        String flowId = authFlowService.createSession(userId, purpose, nextState);

        // Assert
        assertNotNull(flowId);
        String expectedKey = KEY_PREFIX + flowId;
        Map<String, String> expectedHash = Map.of(
                HASH_KEY_USER_ID, userId.toString(),
                HASH_KEY_PURPOSE, purpose.name().toLowerCase(),
                HASH_KEY_NEXT_STATE, nextState.name().toLowerCase()
        );

        verify(hashOperations).putAll(eq(expectedKey), eq(expectedHash));
        verify(stringRedisTemplate).expire(eq(expectedKey), eq(Duration.ofSeconds(600)));
    }

    @Test
    void shouldGetSessionSuccessfully() {
        // Arrange
        String flowId = UUID.randomUUID().toString();
        String redisKey = KEY_PREFIX + flowId;
        UUID userId = UUID.randomUUID();
        VerificationPurpose purpose = VerificationPurpose.REGISTER;

        Map<Object, Object> flowData = Map.of(
                HASH_KEY_USER_ID, userId.toString(),
                HASH_KEY_PURPOSE, purpose.name().toLowerCase()
        );

        doReturn(hashOperations).when(stringRedisTemplate).opsForHash();
        when(hashOperations.entries(redisKey)).thenReturn(flowData);

        // Act
        AuthSessionData result = authFlowService.getSession(flowId);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.userId());
        assertEquals(purpose, result.purpose());
    }

    @Test
    void shouldThrowExceptionWhenSessionNotFound() {
        // Arrange
        String flowId = UUID.randomUUID().toString();
        String redisKey = KEY_PREFIX + flowId;

        doReturn(hashOperations).when(stringRedisTemplate).opsForHash();
        when(hashOperations.entries(redisKey)).thenReturn(Collections.emptyMap());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> authFlowService.getSession(flowId));

        assertEquals(ErrorCode.AUTH_FLOW_SESSION_EXPIRED, exception.getErrorCode());
    }

    @Test
    void shouldThrowExceptionWhenSessionDataIsNull() {
        // Arrange
        String flowId = UUID.randomUUID().toString();
        String redisKey = KEY_PREFIX + flowId;

        doReturn(hashOperations).when(stringRedisTemplate).opsForHash();
        when(hashOperations.entries(redisKey)).thenReturn(null);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> authFlowService.getSession(flowId));

        assertEquals(ErrorCode.AUTH_FLOW_SESSION_EXPIRED, exception.getErrorCode());
    }

    @Test
    void shouldDeleteSessionSuccessfully() {
        // Arrange
        String flowId = UUID.randomUUID().toString();
        String redisKey = KEY_PREFIX + flowId;

        // Act
        authFlowService.deleteSession(flowId);

        // Assert
        verify(stringRedisTemplate).delete(eq(redisKey));
    }

}
