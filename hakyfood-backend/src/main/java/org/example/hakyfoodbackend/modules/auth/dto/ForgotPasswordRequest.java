package org.example.hakyfoodbackend.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(

        @NotBlank(message = "email.required")
        @Email(message = "email.invalid")
        String email

) { }
