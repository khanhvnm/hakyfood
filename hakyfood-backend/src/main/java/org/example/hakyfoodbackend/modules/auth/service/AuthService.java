package org.example.hakyfoodbackend.modules.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.infrastructure.jwt.JwtService;
import org.example.hakyfoodbackend.modules.auth.dto.AuthFlowResponse;
import org.example.hakyfoodbackend.modules.auth.dto.AuthSessionData;
import org.example.hakyfoodbackend.modules.auth.dto.RegisterRequest;
import org.example.hakyfoodbackend.modules.auth.dto.VerifyOtpRequest;
import org.example.hakyfoodbackend.modules.auth.dto.VerifyOtpResult;
import org.example.hakyfoodbackend.modules.auth.enums.AuthFlowState;
import org.example.hakyfoodbackend.modules.auth.enums.VerificationPurpose;
import org.example.hakyfoodbackend.modules.user.entity.User;
import org.example.hakyfoodbackend.modules.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final AuthFlowService authFlowService;
    private final OtpService otpService;
    private final AuthMailService authMailService;
    private final JwtService jwtService;

    public AuthFlowResponse register(RegisterRequest request) {
        UUID userId = userService.createLocalUser(request.email(), request.password());

        String flowId = authFlowService.createSession(userId, VerificationPurpose.REGISTER, AuthFlowState.VERIFY_OTP);

        String code = otpService.generateAndSaveOtp(userId, VerificationPurpose.REGISTER);

        authMailService.sendVerificationEmail(request.email(), code);

        return new AuthFlowResponse(flowId, AuthFlowState.VERIFY_OTP);
    }

    @Transactional
    public VerifyOtpResult verifyOtp(VerifyOtpRequest request) {
        AuthSessionData sessionData = authFlowService.getSession(request.flowId());

        UUID userId = sessionData.userId();
        VerificationPurpose purpose = sessionData.purpose();

        otpService.verifyOtp(userId, purpose, request.code());

        switch (purpose) {
            case VerificationPurpose.REGISTER:
                userService.activateAccount(userId);
                authFlowService.deleteSession(request.flowId());

                User user = userService.getUserById(userId);
                String accessToken = jwtService.generateAccessToken(user);
                String refreshToken = jwtService.generateRefreshToken(user);

                return new VerifyOtpResult(null, AuthFlowState.SUCCESS, accessToken, refreshToken);
            default:
                log.error("Unknown verification purpose: {}", purpose);
                throw new AppException(ErrorCode.OTP_VERIFICATION_FAILED);
        }
    }

}
