package org.example.hakyfoodbackend.modules.auth.dto;

import org.example.hakyfoodbackend.modules.auth.enums.VerificationPurpose;

import java.util.UUID;

public record AuthSessionData(
    UUID userId,
    VerificationPurpose purpose
) { }