package org.example.hakyfoodbackend.modules.menu.dto;

import org.example.hakyfoodbackend.modules.menu.entity.Food;

import java.math.BigDecimal;
import java.util.UUID;

public record ClientMenuFoodResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String imageUrl,
        BigDecimal basePrice
) {

    public static ClientMenuFoodResponse fromEntity(Food entity) {
        return new ClientMenuFoodResponse(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getDescription(),
                entity.getImageUrl(),
                entity.getBasePrice()
        );
    }
}
