package org.example.hakyfoodbackend.modules.menu.dto;

import org.example.hakyfoodbackend.modules.menu.entity.OptionItem;
import org.example.hakyfoodbackend.modules.menu.enums.OptionItemStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record OptionItemResponse(
        UUID id,
        String name,
        BigDecimal additionalPrice,
        Integer displayOrder,
        OptionItemStatus status
) {

    public static OptionItemResponse fromEntity(OptionItem entity) {
        return new OptionItemResponse(
                entity.getId(),
                entity.getName(),
                entity.getAdditionalPrice(),
                entity.getDisplayOrder(),
                entity.getStatus()
        );
    }
}
