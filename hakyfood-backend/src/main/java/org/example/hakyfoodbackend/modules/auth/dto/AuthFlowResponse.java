package org.example.hakyfoodbackend.modules.auth.dto;

import org.example.hakyfoodbackend.modules.auth.enums.AuthFlowState;

public record AuthFlowResponse(
        String flowId,
        AuthFlowState nextState
) { }