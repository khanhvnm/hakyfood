package org.example.hakyfoodbackend.modules.menu.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.hakyfoodbackend.modules.menu.enums.OptionItemStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record OptionItemRequest(
        UUID id,

        @NotBlank(message = "Tên tùy chọn không được để trống")
        @Size(max = 100, message = "Tên tùy chọn tối đa 100 ký tự")
        String name,

        @NotNull(message = "Giá phụ thu không được để trống")
        @Min(value = 0, message = "Giá phụ thu phải lớn hơn hoặc bằng 0")
        BigDecimal additionalPrice,

        @Min(value = 0, message = "Thứ tự hiển thị phải lớn hơn hoặc bằng 0")
        Integer displayOrder,

        OptionItemStatus status
) {
}
