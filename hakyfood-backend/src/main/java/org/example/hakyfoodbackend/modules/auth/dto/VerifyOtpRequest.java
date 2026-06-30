package org.example.hakyfoodbackend.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyOtpRequest(

        @NotBlank(message = "flowId.required")
        String flowId,

        @NotBlank(message = "code.required")
        @Size(min = 6, max = 6, message = "code.invalid")
        String code

) { }