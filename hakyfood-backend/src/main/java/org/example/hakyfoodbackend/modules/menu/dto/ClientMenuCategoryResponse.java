package org.example.hakyfoodbackend.modules.menu.dto;

import java.util.List;
import java.util.UUID;

public record ClientMenuCategoryResponse(
        UUID id,
        String name,
        String slug,
        String iconUrl,
        Integer displayOrder,
        List<ClientMenuFoodResponse> foods,
        List<ClientMenuCategoryResponse> children
) {
}
