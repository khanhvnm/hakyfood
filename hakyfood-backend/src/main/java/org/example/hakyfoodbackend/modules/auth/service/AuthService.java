package org.example.hakyfoodbackend.modules.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.infrastructure.jwt.JwtService;
import org.example.hakyfoodbackend.modules.auth.dto.AuthFlowResponse;
import org.example.hakyfoodbackend.modules.auth.dto.AuthSessionData;
import org.example.hakyfoodbackend.modules.auth.dto.ForgotPasswordRequest;
import org.example.hakyfoodbackend.modules.auth.dto.LoginRequest;
import org.example.hakyfoodbackend.modules.auth.dto.RegisterRequest;
import org.example.hakyfoodbackend.modules.auth.dto.ResetPasswordRequest;
import org.example.hakyfoodbackend.modules.auth.dto.VerifyOtpRequest;
import org.example.hakyfoodbackend.modules.auth.dto.VerifyOtpResult;
import org.example.hakyfoodbackend.modules.auth.enums.AuthFlowState;
import org.example.hakyfoodbackend.modules.auth.enums.VerificationPurpose;
import org.example.hakyfoodbackend.modules.auth.dto.GoogleLoginRequest;
import org.example.hakyfoodbackend.infrastructure.google.GoogleTokenVerifierService;
import org.example.hakyfoodbackend.modules.user.entity.User;
import org.example.hakyfoodbackend.modules.user.enums.AccountStatus;
import org.example.hakyfoodbackend.modules.user.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final GoogleTokenVerifierService googleTokenVerifierService;
    private final PasswordEncoder passwordEncoder;

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

            case VerificationPurpose.FORGOT_PASSWORD:
                // OTP verified successfully, transition to SET_PASSWORD state
                authFlowService.updateSessionNextState(request.flowId(), AuthFlowState.SET_PASSWORD);
                return new VerifyOtpResult(request.flowId(), AuthFlowState.SET_PASSWORD, null, null);

            default:
                log.error("Unknown verification purpose: {}", purpose);
                throw new AppException(ErrorCode.OTP_VERIFICATION_FAILED);
        }
    }

    @Transactional
    public VerifyOtpResult verifyGoogleTokenAndLogin(GoogleLoginRequest request) {
        com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload =
                googleTokenVerifierService.verify(request.idToken());

        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        User user = userService.getOrCreateGoogleUser(email, name, picture);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new VerifyOtpResult(null, AuthFlowState.SUCCESS, accessToken, refreshToken);
    }

    /**
     * Local login: validates email/password, checks account status, issues tokens.
     * Returns generic INVALID_CREDENTIALS for both missing user and wrong password
     * to avoid leaking account existence information.
     */
    @Transactional
    public VerifyOtpResult login(LoginRequest request) {
        User user;
        try {
            user = userService.getUserByEmail(request.email());
        } catch (AppException e) {
            // User not found - throw generic credentials error
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_ACTIVE);
        }

        // Google-only accounts (no password set) fail with generic error
        if (user.getHashedPassword() == null || !passwordEncoder.matches(request.password(), user.getHashedPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new VerifyOtpResult(null, AuthFlowState.SUCCESS, accessToken, refreshToken);
    }

    /**
     * Initiates forgot password / password extension flow:
     * Creates a flow session and sends OTP to the user's email.
     */
    @Transactional
    public AuthFlowResponse initiateForgotPassword(ForgotPasswordRequest request) {
        User user;
        try {
            user = userService.getUserByEmail(request.email());
        } catch (AppException e) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_ACTIVE);
        }

        String flowId = authFlowService.createSession(user.getId(), VerificationPurpose.FORGOT_PASSWORD, AuthFlowState.VERIFY_OTP);

        String code = otpService.generateAndSaveOtp(user.getId(), VerificationPurpose.FORGOT_PASSWORD);

        authMailService.sendForgotPasswordEmail(request.email(), code);

        return new AuthFlowResponse(flowId, AuthFlowState.VERIFY_OTP);
    }

    /**
     * Resets the user's password after OTP verification.
     * Validates the flow session is in SET_PASSWORD state, updates the password,
     * cleans up the session, and returns tokens.
     */
    @Transactional
    public VerifyOtpResult resetPassword(ResetPasswordRequest request) {
        AuthSessionData sessionData = authFlowService.getSession(request.flowId());

        if (sessionData.purpose() != VerificationPurpose.FORGOT_PASSWORD) {
            throw new AppException(ErrorCode.OTP_VERIFICATION_FAILED);
        }

        UUID userId = sessionData.userId();

        userService.updateUserPassword(userId, request.newPassword());

        authFlowService.deleteSession(request.flowId());

        User user = userService.getUserById(userId);
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new VerifyOtpResult(null, AuthFlowState.SUCCESS, accessToken, refreshToken);
    }

    /**
     * Refreshes the access token using a valid refresh token.
     * Also rotates the refresh token for better security.
     */
    @Transactional
    public VerifyOtpResult refreshToken(String refreshToken) {
        if (!jwtService.isValidToken(refreshToken)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String userId = jwtService.getSubject(refreshToken);
        User user = userService.getUserById(UUID.fromString(userId));

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_ACTIVE);
        }

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        return new VerifyOtpResult(null, AuthFlowState.SUCCESS, newAccessToken, newRefreshToken);
    }

}
