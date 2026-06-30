package org.example.hakyfoodbackend.modules.auth.helper;

import org.example.hakyfoodbackend.common.util.CookieUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class AuthCookieHelper {

    private static final String COOKIE_REFRESH_TOKEN_NAME = "refreshToken";

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpirationMs;

    private final CookieUtil cookieUtil;

    public AuthCookieHelper(CookieUtil cookieUtil) {
        this.cookieUtil = cookieUtil;
    }

    public ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return cookieUtil.createSecureCookie(
                COOKIE_REFRESH_TOKEN_NAME,
                refreshToken,
                refreshExpirationMs / 1000
        );
    }

    public ResponseCookie deleteRefreshTokenCookie() {
        return cookieUtil.createSecureCookie(
                COOKIE_REFRESH_TOKEN_NAME,
                "",
                0
        );
    }

}
