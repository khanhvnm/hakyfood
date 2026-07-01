package org.example.hakyfoodbackend.modules.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.modules.auth.dto.AuthSessionData;
import org.example.hakyfoodbackend.modules.auth.enums.AuthFlowState;
import org.example.hakyfoodbackend.modules.auth.enums.VerificationPurpose;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthFlowService {

    private static final String KEY_PREFIX = "auth:flow:";
    private static final String HASH_KEY_USER_ID = "userId";
    private static final String HASH_KEY_PURPOSE = "purpose";
    private static final String HASH_KEY_NEXT_STATE = "nextState";
    private static final int SESSION_TTL_SECONDS = 600;     // 10 minutes

    private final StringRedisTemplate stringRedisTemplate;

    public String createSession(UUID userId, VerificationPurpose purpose, AuthFlowState nextState) {
        String flowId = UUID.randomUUID().toString();
        String redisKey = KEY_PREFIX + flowId;

        Map<String, String> flowData = Map.of(
                HASH_KEY_USER_ID, userId.toString(),
                HASH_KEY_PURPOSE, purpose.name().toLowerCase(),
                HASH_KEY_NEXT_STATE, nextState.name().toLowerCase()
        );
        stringRedisTemplate.opsForHash().putAll(redisKey, flowData);
        stringRedisTemplate.expire(redisKey, Duration.ofSeconds(SESSION_TTL_SECONDS));

        return flowId;
    }

    public AuthSessionData getSession(String flowId) {
        String redisKey = KEY_PREFIX + flowId;

        Map<Object, Object> flowData = stringRedisTemplate.opsForHash().entries(redisKey);
        if (flowData == null || flowData.isEmpty()) {
            throw new AppException(ErrorCode.AUTH_FLOW_SESSION_EXPIRED);
        }

        UUID userId = UUID.fromString((String) flowData.get(HASH_KEY_USER_ID));
        VerificationPurpose purpose = VerificationPurpose.fromString((String) flowData.get(HASH_KEY_PURPOSE));

        return new AuthSessionData(userId, purpose);
    }

    public void deleteSession(String flowId) {
        stringRedisTemplate.delete(KEY_PREFIX + flowId);
    }

    public void updateSessionNextState(String flowId, AuthFlowState nextState) {
        String redisKey = KEY_PREFIX + flowId;
        stringRedisTemplate.opsForHash().put(redisKey, HASH_KEY_NEXT_STATE, nextState.name().toLowerCase());
    }

}
