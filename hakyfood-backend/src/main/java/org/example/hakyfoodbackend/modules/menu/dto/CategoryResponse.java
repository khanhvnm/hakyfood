package org.example.hakyfoodbackend.modules.menu.dto;

import org.example.hakyfoodbackend.modules.menu.entity.Category;
import org.example.hakyfoodbackend.modules.menu.enums.CategoryStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String slug,
        String iconUrl,
        Integer displayOrder,
        CategoryStatus status,
        UUID parentId,
        List<CategoryResponse> children,
        Instant createdAt,
        Instant updatedAt
) {

    /**
     * Chuyển đổi Entity sang Response DTO (không bao gồm children).
     */
    public static CategoryResponse fromEntity(Category entity) {
        return new CategoryResponse(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getIconUrl(),
                entity.getDisplayOrder(),
                entity.getStatus(),
                entity.getParent() != null ? entity.getParent().getId() : null,
                null,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    /**
     * Chuyển đổi Entity sang Response DTO (bao gồm danh sách children đệ quy).
     */
    public static CategoryResponse fromEntityWithChildren(Category entity) {
        List<CategoryResponse> childResponses = entity.getChildren() != null
                ? entity.getChildren().stream()
                    .sorted((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()))
                    .map(CategoryResponse::fromEntityWithChildren)
                    .toList()
                : List.of();

        return new CategoryResponse(
                entity.getId(),
                entity.getName(),
                entity.getSlug(),
                entity.getIconUrl(),
                entity.getDisplayOrder(),
                entity.getStatus(),
                entity.getParent() != null ? entity.getParent().getId() : null,
                childResponses,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
