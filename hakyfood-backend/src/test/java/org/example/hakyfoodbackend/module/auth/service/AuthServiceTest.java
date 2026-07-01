package org.example.hakyfoodbackend.module.auth.service;

import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.infrastructure.jwt.JwtService;
import org.example.hakyfoodbackend.modules.auth.dto.*;
import org.example.hakyfoodbackend.modules.auth.enums.AuthFlowState;
import org.example.hakyfoodbackend.modules.auth.enums.VerificationPurpose;
import org.example.hakyfoodbackend.modules.auth.service.AuthFlowService;
import org.example.hakyfoodbackend.modules.auth.service.AuthMailService;
import org.example.hakyfoodbackend.modules.auth.service.AuthService;
import org.example.hakyfoodbackend.modules.auth.service.OtpService;
import org.example.hakyfoodbackend.infrastructure.google.GoogleTokenVerifierService;
import org.example.hakyfoodbackend.modules.user.entity.User;
import org.example.hakyfoodbackend.modules.user.enums.AccountStatus;
import org.example.hakyfoodbackend.modules.user.enums.AuthProvider;
import org.example.hakyfoodbackend.modules.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

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

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    // =================== REGISTER TESTS ===================

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

    // =================== VERIFY OTP TESTS ===================

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
    void shouldVerifyOtpSuccessfullyForForgotPassword() {
        // Arrange
        String flowId = "forgot-flow-id";
        VerifyOtpRequest request = new VerifyOtpRequest(flowId, "654321");
        UUID userId = UUID.randomUUID();
        AuthSessionData sessionData = new AuthSessionData(userId, VerificationPurpose.FORGOT_PASSWORD);

        when(authFlowService.getSession(flowId)).thenReturn(sessionData);
        doNothing().when(otpService).verifyOtp(userId, VerificationPurpose.FORGOT_PASSWORD, request.code());
        doNothing().when(authFlowService).updateSessionNextState(flowId, AuthFlowState.SET_PASSWORD);

        // Act
        VerifyOtpResult result = authService.verifyOtp(request);

        // Assert
        assertEquals(flowId, result.flowId());
        assertEquals(AuthFlowState.SET_PASSWORD, result.nextState());
        assertNull(result.accessToken());
        assertNull(result.refreshToken());

        verify(authFlowService).getSession(flowId);
        verify(otpService).verifyOtp(userId, VerificationPurpose.FORGOT_PASSWORD, request.code());
        verify(authFlowService).updateSessionNextState(flowId, AuthFlowState.SET_PASSWORD);
        verify(userService, never()).activateAccount(any());
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

    // =================== GOOGLE LOGIN TESTS ===================

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

    // =================== LOCAL LOGIN TESTS ===================

    @Test
    void shouldLoginSuccessfullyWithEmailAndPassword() {
        // Arrange
        LoginRequest request = new LoginRequest("user@test.com", "password123");
        User user = User.builder()
                .email("user@test.com")
                .hashedPassword("hashed-password")
                .accountStatus(AccountStatus.ACTIVE)
                .roles(new HashSet<>())
                .build();

        when(userService.getUserByEmail("user@test.com")).thenReturn(user);
        when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);
        when(jwtService.generateAccessToken(user)).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(user)).thenReturn("refreshToken");

        // Act
        VerifyOtpResult result = authService.login(request);

        // Assert
        assertNull(result.flowId());
        assertEquals(AuthFlowState.SUCCESS, result.nextState());
        assertEquals("accessToken", result.accessToken());
        assertEquals("refreshToken", result.refreshToken());

        verify(userService).getUserByEmail("user@test.com");
        verify(passwordEncoder).matches("password123", "hashed-password");
    }

    @Test
    void shouldThrowInvalidCredentialsWhenUserNotFound() {
        // Arrange
        LoginRequest request = new LoginRequest("unknown@test.com", "password123");

        when(userService.getUserByEmail("unknown@test.com"))
                .thenThrow(new AppException(ErrorCode.USER_NOT_FOUND));

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> authService.login(request));

        assertEquals(ErrorCode.INVALID_CREDENTIALS, exception.getErrorCode());
    }

    @Test
    void shouldThrowAccountNotActiveWhenStatusIsPending() {
        // Arrange
        LoginRequest request = new LoginRequest("user@test.com", "password123");
        User user = User.builder()
                .email("user@test.com")
                .accountStatus(AccountStatus.PENDING_VERIFY)
                .roles(new HashSet<>())
                .build();

        when(userService.getUserByEmail("user@test.com")).thenReturn(user);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> authService.login(request));

        assertEquals(ErrorCode.ACCOUNT_NOT_ACTIVE, exception.getErrorCode());
    }

    @Test
    void shouldThrowInvalidCredentialsWhenPasswordIsWrong() {
        // Arrange
        LoginRequest request = new LoginRequest("user@test.com", "wrong-password");
        User user = User.builder()
                .email("user@test.com")
                .hashedPassword("hashed-password")
                .accountStatus(AccountStatus.ACTIVE)
                .roles(new HashSet<>())
                .build();

        when(userService.getUserByEmail("user@test.com")).thenReturn(user);
        when(passwordEncoder.matches("wrong-password", "hashed-password")).thenReturn(false);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> authService.login(request));

        assertEquals(ErrorCode.INVALID_CREDENTIALS, exception.getErrorCode());
    }

    @Test
    void shouldThrowInvalidCredentialsWhenGoogleAccountHasNoPassword() {
        // Arrange: Google-only account with null password
        LoginRequest request = new LoginRequest("google@test.com", "password123");
        User user = User.builder()
                .email("google@test.com")
                .hashedPassword(null) // Google account has no password
                .authProvider(AuthProvider.GOOGLE)
                .accountStatus(AccountStatus.ACTIVE)
                .roles(new HashSet<>())
                .build();

        when(userService.getUserByEmail("google@test.com")).thenReturn(user);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> authService.login(request));

        assertEquals(ErrorCode.INVALID_CREDENTIALS, exception.getErrorCode());
    }

    // =================== FORGOT PASSWORD TESTS ===================

    @Test
    void shouldInitiateForgotPasswordSuccessfully() {
        // Arrange
        ForgotPasswordRequest request = new ForgotPasswordRequest("user@test.com");
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .email("user@test.com")
                .accountStatus(AccountStatus.ACTIVE)
                .roles(new HashSet<>())
                .build();
        String flowId = "flow-123";
        String code = "654321";

        when(userService.getUserByEmail("user@test.com")).thenReturn(user);
        when(authFlowService.createSession(any(), eq(VerificationPurpose.FORGOT_PASSWORD), eq(AuthFlowState.VERIFY_OTP)))
                .thenReturn(flowId);
        when(otpService.generateAndSaveOtp(any(), eq(VerificationPurpose.FORGOT_PASSWORD))).thenReturn(code);
        doNothing().when(authMailService).sendForgotPasswordEmail("user@test.com", code);

        // Act
        AuthFlowResponse response = authService.initiateForgotPassword(request);

        // Assert
        assertEquals(flowId, response.flowId());
        assertEquals(AuthFlowState.VERIFY_OTP, response.nextState());

        verify(authMailService).sendForgotPasswordEmail("user@test.com", code);
    }

    // =================== RESET PASSWORD TESTS ===================

    @Test
    void shouldResetPasswordSuccessfully() {
        // Arrange
        String flowId = "reset-flow-id";
        ResetPasswordRequest request = new ResetPasswordRequest(flowId, "newPassword123");
        UUID userId = UUID.randomUUID();
        AuthSessionData sessionData = new AuthSessionData(userId, VerificationPurpose.FORGOT_PASSWORD);
        User user = User.builder().email("user@test.com").roles(new HashSet<>()).build();

        when(authFlowService.getSession(flowId)).thenReturn(sessionData);
        doNothing().when(userService).updateUserPassword(userId, "newPassword123");
        doNothing().when(authFlowService).deleteSession(flowId);
        when(userService.getUserById(userId)).thenReturn(user);
        when(jwtService.generateAccessToken(user)).thenReturn("newAccessToken");
        when(jwtService.generateRefreshToken(user)).thenReturn("newRefreshToken");

        // Act
        VerifyOtpResult result = authService.resetPassword(request);

        // Assert
        assertNull(result.flowId());
        assertEquals(AuthFlowState.SUCCESS, result.nextState());
        assertEquals("newAccessToken", result.accessToken());
        assertEquals("newRefreshToken", result.refreshToken());

        verify(userService).updateUserPassword(userId, "newPassword123");
        verify(authFlowService).deleteSession(flowId);
    }

    // =================== REFRESH TOKEN TESTS ===================

    @Test
    void shouldRefreshTokenSuccessfully() {
        // Arrange
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .email("user@test.com")
                .accountStatus(AccountStatus.ACTIVE)
                .roles(new HashSet<>())
                .build();

        when(jwtService.isValidToken("valid-refresh-token")).thenReturn(true);
        when(jwtService.getSubject("valid-refresh-token")).thenReturn(userId.toString());
        when(userService.getUserById(userId)).thenReturn(user);
        when(jwtService.generateAccessToken(user)).thenReturn("newAccessToken");
        when(jwtService.generateRefreshToken(user)).thenReturn("newRefreshToken");

        // Act
        VerifyOtpResult result = authService.refreshToken("valid-refresh-token");

        // Assert
        assertNull(result.flowId());
        assertEquals(AuthFlowState.SUCCESS, result.nextState());
        assertEquals("newAccessToken", result.accessToken());
        assertEquals("newRefreshToken", result.refreshToken());
    }

    @Test
    void shouldThrowUnauthorizedWhenRefreshTokenIsInvalid() {
        // Arrange
        when(jwtService.isValidToken("invalid-token")).thenReturn(false);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> authService.refreshToken("invalid-token"));

        assertEquals(ErrorCode.UNAUTHORIZED, exception.getErrorCode());
    }

}
