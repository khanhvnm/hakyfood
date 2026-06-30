package org.example.hakyfoodbackend.module.auth.service;

import org.example.hakyfoodbackend.infrastructure.mail.MailService;
import org.example.hakyfoodbackend.modules.auth.service.AuthMailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthMailServiceTest {

    @Mock
    private MailService mailService;

    @InjectMocks
    private AuthMailService authMailService;

    @Test
    void shouldSendVerificationEmailSuccessfully() {
        // Arrange
        String email = "test@example.com";
        String code = "123456";
        String expectedSubject = "Verification Email";
        String expectedContent = "Your verification code is: " + code;

        doNothing().when(mailService).sendMail(eq(email), eq(expectedSubject), eq(expectedContent));

        // Act
        authMailService.sendVerificationEmail(email, code);

        // Assert
        verify(mailService).sendMail(eq(email), eq(expectedSubject), eq(expectedContent));
    }

}
