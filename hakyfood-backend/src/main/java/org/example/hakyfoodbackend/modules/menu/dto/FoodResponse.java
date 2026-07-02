package org.example.hakyfoodbackend.modules.menu.dto;

import org.example.hakyfoodbackend.modules.menu.entity.Food;
import org.example.hakyfoodbackend.modules.menu.enums.FoodStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record FoodResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String imageUrl,
        BigDecimal basePrice,
        FoodStatus status,
        List<CategoryResponse> categories,
        List<OptionGroupResponse> optionGroups,
        Instant createdAt,
        Instant updatedAt
) {

    public static FoodResponse fromEntity(Food entity) {
        List<CategoryResponse> categoryResponses = entity.getCategories() != null
                ? entity.getCategories().stream()
                    .map(CategoryResponse::fromEntity)
                    .toList()
                : List.of();

        List<OptionGroupResponse> optionGroupResponses = entity.getOptionGroups() != null
                ? entity.getOptionGroups().stream()
                    .map(OptionGroupResponse::fromEntity)
                    .toList()
                : List.of();

        return new FoodResponse(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getDescription(),
                entity.getImageUrl(),
                entity.getBasePrice(),
                entity.getStatus(),
                categoryResponses,
                optionGroupResponses,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
