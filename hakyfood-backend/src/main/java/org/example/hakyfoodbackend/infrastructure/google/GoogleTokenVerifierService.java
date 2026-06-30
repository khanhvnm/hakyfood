package org.example.hakyfoodbackend.infrastructure.google;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Slf4j
@Service
public class GoogleTokenVerifierService {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifierService(@Value("${app.google.client-id:dummy-client-id}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                new GsonFactory()
        )
        .setAudience(Collections.singletonList(clientId))
        .build();
    }

    public GoogleIdToken.Payload verify(String idTokenString) {
        if (idTokenString == null || idTokenString.trim().isEmpty()) {
            log.error("Google ID Token is null or empty");
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                return idToken.getPayload();
            } else {
                log.error("Google ID Token verification failed (idToken is null)");
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        } catch (IllegalArgumentException e) {
            log.error("Invalid Google ID Token format: ", e);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        } catch (GeneralSecurityException | IOException e) {
            log.error("Error occurred while verifying Google ID Token: ", e);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }
}
