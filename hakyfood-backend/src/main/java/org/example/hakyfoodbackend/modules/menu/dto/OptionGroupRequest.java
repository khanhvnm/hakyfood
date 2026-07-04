package org.example.hakyfoodbackend.modules.menu.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record OptionGroupRequest(

        @NotBlank(message = "Tên nhóm tùy chọn không được để trống")
        @Size(max = 100, message = "Tên nhóm tùy chọn tối đa 100 ký tự")
        String name,

        @Size(max = 120, message = "Slug tối đa 120 ký tự")
        String slug,

        @Size(max = 255, message = "Mô tả tối đa 255 ký tự")
        String description,

        Boolean isRequired,

        @Min(value = 0, message = "Số lượng lựa chọn tối thiểu phải lớn hơn hoặc bằng 0")
        Integer minChoices,

        @Min(value = 0, message = "Số lượng lựa chọn tối đa phải lớn hơn hoặc bằng 0")
        Integer maxChoices,

        @Valid
        List<OptionItemRequest> optionItems
) {
}
