package org.example.hakyfoodbackend.modules.menu.dto;

import org.example.hakyfoodbackend.modules.menu.entity.Food;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ClientFoodDetailResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String imageUrl,
        BigDecimal basePrice,
        List<OptionGroupResponse> optionGroups
) {

    public static ClientFoodDetailResponse fromEntity(Food entity) {
        List<OptionGroupResponse> groups = entity.getOptionGroups() != null
                ? entity.getOptionGroups().stream()
                    .map(OptionGroupResponse::fromEntity)
                    .toList()
                : List.of();

        return new ClientFoodDetailResponse(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getDescription(),
                entity.getImageUrl(),
                entity.getBasePrice(),
                groups
        );
    }
}
