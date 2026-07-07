package org.example.hakyfoodbackend.modules.menu.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.hakyfoodbackend.common.response.ApiResponse;
import org.example.hakyfoodbackend.modules.menu.dto.FoodRequest;
import org.example.hakyfoodbackend.modules.menu.dto.FoodResponse;
import org.example.hakyfoodbackend.modules.menu.service.FoodService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @PostMapping
    @PreAuthorize("hasAuthority('menu.food')")
    public ResponseEntity<ApiResponse<FoodResponse>> createFood(
            @RequestBody @Valid FoodRequest request,
            HttpServletRequest httpRequest
    ) {
        FoodResponse response = foodService.createFood(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, httpRequest));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('menu.food')")
    public ResponseEntity<ApiResponse<FoodResponse>> updateFood(
            @PathVariable UUID id,
            @RequestBody @Valid FoodRequest request,
            HttpServletRequest httpRequest
    ) {
        FoodResponse response = foodService.updateFood(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, httpRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('menu.food')")
    public ResponseEntity<ApiResponse<Void>> deleteFood(
            @PathVariable UUID id,
            HttpServletRequest httpRequest
    ) {
        foodService.deleteFood(id);
        return ResponseEntity.ok(ApiResponse.success(null, httpRequest));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('menu.food')")
    public ResponseEntity<ApiResponse<List<FoodResponse>>> getAllFoods(
            HttpServletRequest httpRequest
    ) {
        List<FoodResponse> response = foodService.getAllFoods();
        return ResponseEntity.ok(ApiResponse.success(response, httpRequest));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('menu.food')")
    public ResponseEntity<ApiResponse<FoodResponse>> getFoodById(
            @PathVariable UUID id,
            HttpServletRequest httpRequest
    ) {
        FoodResponse response = foodService.getFoodById(id);
        return ResponseEntity.ok(ApiResponse.success(response, httpRequest));
    }
}
