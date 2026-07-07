package org.example.hakyfoodbackend.modules.menu.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.hakyfoodbackend.common.response.ApiResponse;
import org.example.hakyfoodbackend.modules.menu.dto.OptionGroupRequest;
import org.example.hakyfoodbackend.modules.menu.dto.OptionGroupResponse;
import org.example.hakyfoodbackend.modules.menu.service.OptionGroupService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/option-groups")
@RequiredArgsConstructor
public class OptionGroupController {

    private final OptionGroupService optionGroupService;

    @PostMapping
    @PreAuthorize("hasAuthority('menu.food')")
    public ResponseEntity<ApiResponse<OptionGroupResponse>> createOptionGroup(
            @RequestBody @Valid OptionGroupRequest request,
            HttpServletRequest httpRequest
    ) {
        OptionGroupResponse response = optionGroupService.createOptionGroup(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, httpRequest));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('menu.food')")
    public ResponseEntity<ApiResponse<OptionGroupResponse>> updateOptionGroup(
            @PathVariable UUID id,
            @RequestBody @Valid OptionGroupRequest request,
            HttpServletRequest httpRequest
    ) {
        OptionGroupResponse response = optionGroupService.updateOptionGroup(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, httpRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('menu.food')")
    public ResponseEntity<ApiResponse<Void>> deleteOptionGroup(
            @PathVariable UUID id,
            HttpServletRequest httpRequest
    ) {
        optionGroupService.deleteOptionGroup(id);
        return ResponseEntity.ok(ApiResponse.success(null, httpRequest));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('menu.food')")
    public ResponseEntity<ApiResponse<List<OptionGroupResponse>>> getAllOptionGroups(
            HttpServletRequest httpRequest
    ) {
        List<OptionGroupResponse> response = optionGroupService.getAllOptionGroups();
        return ResponseEntity.ok(ApiResponse.success(response, httpRequest));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('menu.food')")
    public ResponseEntity<ApiResponse<OptionGroupResponse>> getOptionGroupById(
            @PathVariable UUID id,
            HttpServletRequest httpRequest
    ) {
        OptionGroupResponse response = optionGroupService.getOptionGroupById(id);
        return ResponseEntity.ok(ApiResponse.success(response, httpRequest));
    }
}
