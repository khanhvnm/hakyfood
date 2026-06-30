package org.example.hakyfoodbackend.modules.auth.dto;

import org.example.hakyfoodbackend.modules.auth.enums.AuthFlowState;

public record VerifyOtpResponse(
        String flowId,
        AuthFlowState nextState,
        String accessToken
) {}
