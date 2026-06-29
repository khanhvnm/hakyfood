package org.example.hakyfoodbackend.modules.auth.service;

import lombok.RequiredArgsConstructor;
import org.example.hakyfoodbackend.infrastructure.mail.MailService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthMailService {

    private final MailService mailService;

    @Async("emailExecutor")
    public void sendVerificationEmail(String email, String code) {
        String subject = "Verification Email";
        String content = "Your verification code is: " + code;
        mailService.sendMail(email, subject, content);
    }


}
