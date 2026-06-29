package org.example.hakyfoodbackend.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "email.required")
        @Email(message = "email.invalid")
        String email,

        @NotBlank(message = "password.required")
        @Size(min = 8, message = "password.too_short")
        String password

) { }