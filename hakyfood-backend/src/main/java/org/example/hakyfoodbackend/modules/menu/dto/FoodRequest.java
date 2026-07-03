package org.example.hakyfoodbackend.modules.menu.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.hakyfoodbackend.modules.menu.enums.FoodStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public record FoodRequest(
        @NotBlank(message = "Tên món ăn không được để trống")
        @Size(max = 150, message = "Tên món ăn tối đa 150 ký tự")
        String name,

        @Size(max = 170, message = "Slug tối đa 170 ký tự")
        String slug,

        String description,

        String imageUrl,

        List<String> detailImageUrls,

        @NotNull(message = "Giá cơ bản không được để trống")
        @Min(value = 0, message = "Giá cơ bản phải lớn hơn hoặc bằng 0")
        BigDecimal basePrice,

        FoodStatus status,

        Set<UUID> categoryIds,

        Set<UUID> optionGroupIds
) {
}
