package org.example.hakyfoodbackend.modules.menu.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.hakyfoodbackend.common.response.ApiResponse;
import org.example.hakyfoodbackend.modules.menu.dto.CategoryRequest;
import org.example.hakyfoodbackend.modules.menu.dto.CategoryResponse;
import org.example.hakyfoodbackend.modules.menu.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasAuthority('menu.category')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @RequestBody @Valid CategoryRequest request,
            HttpServletRequest httpRequest
    ) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, httpRequest));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('menu.category')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @RequestBody @Valid CategoryRequest request,
            HttpServletRequest httpRequest
    ) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, httpRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('menu.category')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable UUID id,
            HttpServletRequest httpRequest
    ) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, httpRequest));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('menu.category')")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories(
            HttpServletRequest httpRequest
    ) {
        List<CategoryResponse> response = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(response, httpRequest));
    }

    @GetMapping("/tree")
    @PreAuthorize("hasAuthority('menu.category')")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoryTree(
            HttpServletRequest httpRequest
    ) {
        List<CategoryResponse> response = categoryService.getCategoryTree();
        return ResponseEntity.ok(ApiResponse.success(response, httpRequest));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('menu.category')")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @PathVariable UUID id,
            HttpServletRequest httpRequest
    ) {
        CategoryResponse response = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(response, httpRequest));
    }
}
