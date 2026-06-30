package org.example.hakyfoodbackend.module.auth.service;

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
import org.example.hakyfoodbackend.modules.auth.service.AuthFlowService;
import org.example.hakyfoodbackend.modules.auth.service.AuthMailService;
import org.example.hakyfoodbackend.modules.auth.service.AuthService;
import org.example.hakyfoodbackend.modules.auth.service.OtpService;
import org.example.hakyfoodbackend.infrastructure.google.GoogleTokenVerifierService;
import org.example.hakyfoodbackend.modules.auth.dto.GoogleLoginRequest;
import org.example.hakyfoodbackend.modules.user.entity.User;
import org.example.hakyfoodbackend.modules.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private AuthFlowService authFlowService;

    @Mock
    private OtpService otpService;

    @Mock
    private AuthMailService authMailService;

    @Mock
    private JwtService jwtService;

    @Mock
    private GoogleTokenVerifierService googleTokenVerifierService;

    @InjectMocks
    private AuthService authService;

    @Test
    void shouldRegisterSuccessfully() {
        RegisterRequest request = new RegisterRequest("user@test.com", "123456");
        UUID userId = UUID.randomUUID();
        String flowId = UUID.randomUUID().toString();
        String code = "123456";

        when(userService.createLocalUser(request.email(), request.password())).thenReturn(userId);
        when(authFlowService.createSession(userId, VerificationPurpose.REGISTER, AuthFlowState.VERIFY_OTP)).thenReturn(flowId);
        when(otpService.generateAndSaveOtp(userId, VerificationPurpose.REGISTER)).thenReturn(code);
        doNothing().when(authMailService).sendVerificationEmail(request.email(), code);

        AuthFlowResponse response = authService.register(request);

        assertEquals(flowId, response.flowId());
        assertEquals(AuthFlowState.VERIFY_OTP, response.nextState());

        verify(userService).createLocalUser(request.email(), request.password());
        verify(authFlowService).createSession(userId, VerificationPurpose.REGISTER, AuthFlowState.VERIFY_OTP);
        verify(otpService).generateAndSaveOtp(userId, VerificationPurpose.REGISTER);
        verify(authMailService).sendVerificationEmail(request.email(), code);
    }

    @Test
    void shouldVerifyOtpSuccessfullyForRegister() {
        // Arrange
        VerifyOtpRequest request = new VerifyOtpRequest("some-flow-id", "123456");
        UUID userId = UUID.randomUUID();
        AuthSessionData sessionData = new AuthSessionData(userId, VerificationPurpose.REGISTER);
        User user = User.builder().email("user@test.com").roles(new HashSet<>()).build();

        when(authFlowService.getSession(request.flowId())).thenReturn(sessionData);
        doNothing().when(otpService).verifyOtp(userId, VerificationPurpose.REGISTER, request.code());
        doNothing().when(userService).activateAccount(userId);
        doNothing().when(authFlowService).deleteSession(request.flowId());
        when(userService.getUserById(userId)).thenReturn(user);
        when(jwtService.generateAccessToken(user)).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(user)).thenReturn("refreshToken");

        // Act
        VerifyOtpResult result = authService.verifyOtp(request);

        // Assert
        assertNull(result.flowId());
        assertEquals(AuthFlowState.SUCCESS, result.nextState());
        assertEquals("accessToken", result.accessToken());
        assertEquals("refreshToken", result.refreshToken());

        verify(authFlowService).getSession(request.flowId());
        verify(otpService).verifyOtp(userId, VerificationPurpose.REGISTER, request.code());
        verify(userService).activateAccount(userId);
        verify(authFlowService).deleteSession(request.flowId());
        verify(userService).getUserById(userId);
        verify(jwtService).generateAccessToken(user);
        verify(jwtService).generateRefreshToken(user);
    }

    @Test
    void shouldThrowExceptionWhenSessionExpired() {
        // Arrange
        VerifyOtpRequest request = new VerifyOtpRequest("expired-flow-id", "123456");

        when(authFlowService.getSession(request.flowId()))
                .thenThrow(new AppException(ErrorCode.AUTH_FLOW_SESSION_EXPIRED));

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> authService.verifyOtp(request));

        assertEquals(ErrorCode.AUTH_FLOW_SESSION_EXPIRED, exception.getErrorCode());

        verify(authFlowService).getSession(request.flowId());
        verifyNoInteractions(otpService);
        verifyNoInteractions(userService);
    }

    @Test
    void shouldThrowExceptionAndNotActivateWhenOtpVerificationFails() {
        // Arrange
        UUID userId = UUID.randomUUID();
        AuthSessionData sessionData = new AuthSessionData(userId, VerificationPurpose.REGISTER);
        VerifyOtpRequest request = new VerifyOtpRequest("flow-id", "wrong-code");

        when(authFlowService.getSession(request.flowId())).thenReturn(sessionData);
        doThrow(new AppException(ErrorCode.OTP_INCORRECT))
                .when(otpService).verifyOtp(userId, VerificationPurpose.REGISTER, request.code());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> authService.verifyOtp(request));

        assertEquals(ErrorCode.OTP_INCORRECT, exception.getErrorCode());

        verify(authFlowService).getSession(request.flowId());
        verify(otpService).verifyOtp(userId, VerificationPurpose.REGISTER, request.code());
        verify(userService, never()).activateAccount(any());
        verify(authFlowService, never()).deleteSession(anyString());
    }

    @Test
    void shouldThrowVerificationFailedWhenPurposeIsUnsupported() {
        // Arrange
        UUID userId = UUID.randomUUID();
        // Assume FORGOT_PASSWORD is not supported yet in switch case
        AuthSessionData sessionData = new AuthSessionData(userId, VerificationPurpose.FORGOT_PASSWORD);
        VerifyOtpRequest request = new VerifyOtpRequest("flow-id", "123456");

        when(authFlowService.getSession(request.flowId())).thenReturn(sessionData);
        doNothing().when(otpService).verifyOtp(userId, VerificationPurpose.FORGOT_PASSWORD, request.code());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> authService.verifyOtp(request));

        assertEquals(ErrorCode.OTP_VERIFICATION_FAILED, exception.getErrorCode());

        verify(authFlowService).getSession(request.flowId());
        verify(otpService).verifyOtp(userId, VerificationPurpose.FORGOT_PASSWORD, request.code());
        verify(userService, never()).activateAccount(any());
        verify(authFlowService, never()).deleteSession(anyString());
    }

    @Test
    void shouldLoginSuccessfullyWithGoogle() {
        // Arrange
        GoogleLoginRequest request = new GoogleLoginRequest("google-id-token");
        com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload =
                new com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload();
        payload.setEmail("google-user@test.com");
        payload.set("name", "Google User");
        payload.set("picture", "http://avatar.url");

        User user = User.builder().email("google-user@test.com").roles(new HashSet<>()).build();

        when(googleTokenVerifierService.verify("google-id-token")).thenReturn(payload);
        when(userService.getOrCreateGoogleUser("google-user@test.com", "Google User", "http://avatar.url")).thenReturn(user);
        when(jwtService.generateAccessToken(user)).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(user)).thenReturn("refreshToken");

        // Act
        VerifyOtpResult result = authService.verifyGoogleTokenAndLogin(request);

        // Assert
        assertNull(result.flowId());
        assertEquals(AuthFlowState.SUCCESS, result.nextState());
        assertEquals("accessToken", result.accessToken());
        assertEquals("refreshToken", result.refreshToken());

        verify(googleTokenVerifierService).verify("google-id-token");
        verify(userService).getOrCreateGoogleUser("google-user@test.com", "Google User", "http://avatar.url");
        verify(jwtService).generateAccessToken(user);
        verify(jwtService).generateRefreshToken(user);
    }

}
