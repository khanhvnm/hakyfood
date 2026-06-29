package org.example.hakyfoodbackend.modules.auth.service;

import lombok.RequiredArgsConstructor;
import org.example.hakyfoodbackend.modules.auth.dto.AuthFlowResponse;
import org.example.hakyfoodbackend.modules.auth.dto.RegisterRequest;
import org.example.hakyfoodbackend.modules.auth.enums.AuthFlowState;
import org.example.hakyfoodbackend.modules.auth.enums.VerificationPurpose;
import org.example.hakyfoodbackend.modules.user.service.UserService;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final AuthFlowService authFlowService;
    private final OtpService otpService;
    private final AuthMailService authMailService;

    public AuthFlowResponse register(RegisterRequest request) {
        UUID userId = userService.createLocalUser(request.email(), request.password());

        String flowId = authFlowService.createSession(userId, VerificationPurpose.REGISTER, AuthFlowState.VERIFY_OTP);

        String code = otpService.generateAndSaveOtp(userId, VerificationPurpose.REGISTER);

        authMailService.sendVerificationEmail(request.email(), code);

        return new AuthFlowResponse(flowId, AuthFlowState.VERIFY_OTP);
    }

}
