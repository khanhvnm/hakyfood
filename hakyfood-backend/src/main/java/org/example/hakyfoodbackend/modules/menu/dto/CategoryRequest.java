package org.example.hakyfoodbackend.modules.menu.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.example.hakyfoodbackend.modules.menu.enums.CategoryStatus;

import java.util.UUID;

public record CategoryRequest(

        @NotBlank(message = "Tên danh mục không được để trống")
        @Size(max = 100, message = "Tên danh mục tối đa 100 ký tự")
        String name,

        @Size(max = 120, message = "Slug tối đa 120 ký tự")
        String slug,

        String iconUrl,

        @Min(value = 0, message = "Thứ tự hiển thị phải lớn hơn hoặc bằng 0")
        Integer displayOrder,

        CategoryStatus status,

        UUID parentId
) {
}
