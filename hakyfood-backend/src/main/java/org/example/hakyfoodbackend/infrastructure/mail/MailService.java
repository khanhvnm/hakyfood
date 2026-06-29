package org.example.hakyfoodbackend.infrastructure.mail;

public interface MailService {

    void sendMail(String toEmail, String subject, String content);

}
