package org.example.hakyfoodbackend.modules.menu.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.hakyfoodbackend.common.response.ApiResponse;
import org.example.hakyfoodbackend.modules.menu.dto.ClientFoodDetailResponse;
import org.example.hakyfoodbackend.modules.menu.dto.ClientMenuCategoryResponse;
import org.example.hakyfoodbackend.modules.menu.service.MenuClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/client")
@RequiredArgsConstructor
public class MenuClientController {

    private final MenuClientService menuClientService;

    @GetMapping("/menu")
    public ResponseEntity<ApiResponse<List<ClientMenuCategoryResponse>>> getClientMenu(
            HttpServletRequest httpRequest
    ) {
        List<ClientMenuCategoryResponse> response = menuClientService.getClientMenu();
        return ResponseEntity.ok(ApiResponse.success(response, httpRequest));
    }

    @GetMapping("/foods/{id}")
    public ResponseEntity<ApiResponse<ClientFoodDetailResponse>> getClientFoodDetail(
            @PathVariable UUID id,
            HttpServletRequest httpRequest
    ) {
        ClientFoodDetailResponse response = menuClientService.getClientFoodDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response, httpRequest));
    }
}
