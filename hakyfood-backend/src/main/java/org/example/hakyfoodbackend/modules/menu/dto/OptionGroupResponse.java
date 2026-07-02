package org.example.hakyfoodbackend.modules.menu.dto;

import org.example.hakyfoodbackend.modules.menu.entity.OptionGroup;

import java.util.List;
import java.util.UUID;

public record OptionGroupResponse(
        UUID id,
        String name,
        String description,
        Boolean isRequired,
        Integer minChoices,
        Integer maxChoices,
        List<OptionItemResponse> optionItems
) {

    public static OptionGroupResponse fromEntity(OptionGroup entity) {
        List<OptionItemResponse> items = entity.getOptionItems() != null
                ? entity.getOptionItems().stream()
                    .sorted((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()))
                    .map(OptionItemResponse::fromEntity)
                    .toList()
                : List.of();

        return new OptionGroupResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getIsRequired(),
                entity.getMinChoices(),
                entity.getMaxChoices(),
                items
        );
    }
}
