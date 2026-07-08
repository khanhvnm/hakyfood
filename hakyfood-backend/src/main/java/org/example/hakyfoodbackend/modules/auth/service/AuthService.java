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
import org.example.hakyfoodbackend.modules.user.entity.Account;
import org.example.hakyfoodbackend.modules.user.enums.AccountStatus;
import org.example.hakyfoodbackend.modules.user.service.AccountService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AccountService accountService;
    private final AuthFlowService authFlowService;
    private final OtpService otpService;
    private final AuthMailService authMailService;
    private final JwtService jwtService;
    private final GoogleTokenVerifierService googleTokenVerifierService;
    private final PasswordEncoder passwordEncoder;

    public AuthFlowResponse register(RegisterRequest request) {
        UUID accountId = accountService.createLocalAccount(request.email(), request.password());

        String flowId = authFlowService.createSession(accountId, VerificationPurpose.REGISTER, AuthFlowState.VERIFY_OTP);

        String code = otpService.generateAndSaveOtp(accountId, VerificationPurpose.REGISTER);

        authMailService.sendVerificationEmail(request.email(), code);

        return new AuthFlowResponse(flowId, AuthFlowState.VERIFY_OTP);
    }

    @Transactional
    public VerifyOtpResult verifyOtp(VerifyOtpRequest request) {
        AuthSessionData sessionData = authFlowService.getSession(request.flowId());

        UUID accountId = sessionData.userId();
        VerificationPurpose purpose = sessionData.purpose();

        otpService.verifyOtp(accountId, purpose, request.code());

        switch (purpose) {
            case VerificationPurpose.REGISTER:
                accountService.activateAccount(accountId);
                authFlowService.deleteSession(request.flowId());

                Account account = accountService.getAccountById(accountId);
                String accessToken = jwtService.generateAccessToken(account);
                String refreshToken = jwtService.generateRefreshToken(account);

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

        Account account = accountService.getOrCreateGoogleAccount(email, name, picture);

        String accessToken = jwtService.generateAccessToken(account);
        String refreshToken = jwtService.generateRefreshToken(account);

        return new VerifyOtpResult(null, AuthFlowState.SUCCESS, accessToken, refreshToken);
    }

    /**
     * Local login: validates email/password, checks account status, issues tokens.
     * Returns generic INVALID_CREDENTIALS for both missing account and wrong password
     * to avoid leaking account existence information.
     */
    @Transactional
    public VerifyOtpResult login(LoginRequest request) {
        Account account;
        try {
            account = accountService.getAccountByEmail(request.email());
        } catch (AppException e) {
            // Account not found - throw generic credentials error
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (account.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_ACTIVE);
        }

        // Google-only accounts (no password set) fail with generic error
        if (account.getHashedPassword() == null || !passwordEncoder.matches(request.password(), account.getHashedPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        String accessToken = jwtService.generateAccessToken(account);
        String refreshToken = jwtService.generateRefreshToken(account);

        return new VerifyOtpResult(null, AuthFlowState.SUCCESS, accessToken, refreshToken);
    }

    /**
     * Initiates forgot password / password extension flow:
     * Creates a flow session and sends OTP to the account's email.
     */
    @Transactional
    public AuthFlowResponse initiateForgotPassword(ForgotPasswordRequest request) {
        Account account;
        try {
            account = accountService.getAccountByEmail(request.email());
        } catch (AppException e) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }

        if (account.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_ACTIVE);
        }

        String flowId = authFlowService.createSession(account.getId(), VerificationPurpose.FORGOT_PASSWORD, AuthFlowState.VERIFY_OTP);

        String code = otpService.generateAndSaveOtp(account.getId(), VerificationPurpose.FORGOT_PASSWORD);

        authMailService.sendForgotPasswordEmail(request.email(), code);

        return new AuthFlowResponse(flowId, AuthFlowState.VERIFY_OTP);
    }

    /**
     * Resets the account's password after OTP verification.
     * Validates the flow session is in SET_PASSWORD state, updates the password,
     * cleans up the session, and returns tokens.
     */
    @Transactional
    public VerifyOtpResult resetPassword(ResetPasswordRequest request) {
        AuthSessionData sessionData = authFlowService.getSession(request.flowId());

        if (sessionData.purpose() != VerificationPurpose.FORGOT_PASSWORD) {
            throw new AppException(ErrorCode.OTP_VERIFICATION_FAILED);
        }

        UUID accountId = sessionData.userId();

        accountService.updateAccountPassword(accountId, request.newPassword());

        authFlowService.deleteSession(request.flowId());

        Account account = accountService.getAccountById(accountId);
        String accessToken = jwtService.generateAccessToken(account);
        String refreshToken = jwtService.generateRefreshToken(account);

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

        String accountId = jwtService.getSubject(refreshToken);
        Account account = accountService.getAccountById(UUID.fromString(accountId));

        if (account.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_ACTIVE);
        }

        String newAccessToken = jwtService.generateAccessToken(account);
        String newRefreshToken = jwtService.generateRefreshToken(account);

        return new VerifyOtpResult(null, AuthFlowState.SUCCESS, newAccessToken, newRefreshToken);
    }

}
