package org.example.hakyfoodbackend.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(

        @NotBlank(message = "flowId.required")
        String flowId,

        @NotBlank(message = "password.required")
        @Size(min = 8, message = "password.too_short")
        String newPassword

) { }
