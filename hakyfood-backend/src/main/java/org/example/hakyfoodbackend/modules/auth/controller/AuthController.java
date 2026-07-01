package org.example.hakyfoodbackend.modules.auth.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.common.response.ApiResponse;
import org.example.hakyfoodbackend.modules.auth.dto.AuthFlowResponse;
import org.example.hakyfoodbackend.modules.auth.dto.ForgotPasswordRequest;
import org.example.hakyfoodbackend.modules.auth.dto.GoogleLoginRequest;
import org.example.hakyfoodbackend.modules.auth.dto.LoginRequest;
import org.example.hakyfoodbackend.modules.auth.dto.RegisterRequest;
import org.example.hakyfoodbackend.modules.auth.dto.ResetPasswordRequest;
import org.example.hakyfoodbackend.modules.auth.dto.VerifyOtpRequest;
import org.example.hakyfoodbackend.modules.auth.dto.VerifyOtpResponse;
import org.example.hakyfoodbackend.modules.auth.dto.VerifyOtpResult;
import org.example.hakyfoodbackend.modules.auth.helper.AuthCookieHelper;
import org.example.hakyfoodbackend.modules.auth.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthCookieHelper authCookieHelper;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthFlowResponse>> register(
            @RequestBody @Valid RegisterRequest request,
            HttpServletRequest httpRequest
    ) {
        AuthFlowResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, httpRequest));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> verifyOtp(
            @RequestBody @Valid VerifyOtpRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        VerifyOtpResult result = authService.verifyOtp(request);

        if (result.refreshToken() != null) {
            ResponseCookie cookie = authCookieHelper.createRefreshTokenCookie(result.refreshToken());
            httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        VerifyOtpResponse response = new VerifyOtpResponse(
                result.flowId(),
                result.nextState(),
                result.accessToken()
        );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response, httpRequest));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> googleLogin(
            @RequestBody @Valid GoogleLoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        VerifyOtpResult result = authService.verifyGoogleTokenAndLogin(request);

        if (result.refreshToken() != null) {
            ResponseCookie cookie = authCookieHelper.createRefreshTokenCookie(result.refreshToken());
            httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        VerifyOtpResponse response = new VerifyOtpResponse(
                result.flowId(),
                result.nextState(),
                result.accessToken()
        );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response, httpRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> login(
            @RequestBody @Valid LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        VerifyOtpResult result = authService.login(request);

        if (result.refreshToken() != null) {
            ResponseCookie cookie = authCookieHelper.createRefreshTokenCookie(result.refreshToken());
            httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        VerifyOtpResponse response = new VerifyOtpResponse(
                result.flowId(),
                result.nextState(),
                result.accessToken()
        );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response, httpRequest));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<AuthFlowResponse>> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequest request,
            HttpServletRequest httpRequest
    ) {
        AuthFlowResponse response = authService.initiateForgotPassword(request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response, httpRequest));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> resetPassword(
            @RequestBody @Valid ResetPasswordRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        VerifyOtpResult result = authService.resetPassword(request);

        if (result.refreshToken() != null) {
            ResponseCookie cookie = authCookieHelper.createRefreshTokenCookie(result.refreshToken());
            httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        VerifyOtpResponse response = new VerifyOtpResponse(
                result.flowId(),
                result.nextState(),
                result.accessToken()
        );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response, httpRequest));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> refreshToken(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String refreshToken = extractRefreshTokenFromCookies(httpRequest);

        VerifyOtpResult result = authService.refreshToken(refreshToken);

        // Rotate refresh token cookie
        if (result.refreshToken() != null) {
            ResponseCookie cookie = authCookieHelper.createRefreshTokenCookie(result.refreshToken());
            httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        VerifyOtpResponse response = new VerifyOtpResponse(
                result.flowId(),
                result.nextState(),
                result.accessToken()
        );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response, httpRequest));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        // Delete the refresh token cookie
        ResponseCookie cookie = authCookieHelper.deleteRefreshTokenCookie();
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(null, httpRequest));
    }

    /***************************
     * Internal helper methods *
     ***************************/
    private String extractRefreshTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        throw new AppException(ErrorCode.UNAUTHORIZED);
    }

}
