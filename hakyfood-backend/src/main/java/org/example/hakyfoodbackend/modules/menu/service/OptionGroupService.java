package org.example.hakyfoodbackend.modules.menu.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.modules.menu.dto.OptionGroupRequest;
import org.example.hakyfoodbackend.modules.menu.dto.OptionGroupResponse;
import org.example.hakyfoodbackend.modules.menu.dto.OptionItemRequest;
import org.example.hakyfoodbackend.modules.menu.entity.OptionGroup;
import org.example.hakyfoodbackend.modules.menu.entity.OptionItem;
import org.example.hakyfoodbackend.modules.menu.enums.OptionItemStatus;
import org.example.hakyfoodbackend.modules.menu.repository.OptionGroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OptionGroupService {

    private final OptionGroupRepository optionGroupRepository;

    @Transactional
    public OptionGroupResponse createOptionGroup(OptionGroupRequest request) {
        validateConstraints(request.isRequired(), request.minChoices(), request.maxChoices());

        String slug = (request.slug() != null && !request.slug().isBlank())
                ? request.slug()
                : org.example.hakyfoodbackend.common.util.SlugUtil.toSlug(request.name());

        if (optionGroupRepository.existsBySlug(slug)) {
            throw new AppException(ErrorCode.OPTION_GROUP_SLUG_EXISTS);
        }

        OptionGroup optionGroup = OptionGroup.builder()
                .name(request.name())
                .slug(slug)
                .description(request.description())
                .isRequired(request.isRequired() != null ? request.isRequired() : false)
                .minChoices(request.minChoices() != null ? request.minChoices() : 0)
                .maxChoices(request.maxChoices() != null ? request.maxChoices() : 1)
                .build();

        if (request.optionItems() != null) {
            for (OptionItemRequest itemReq : request.optionItems()) {
                OptionItem item = OptionItem.builder()
                        .name(itemReq.name())
                        .additionalPrice(itemReq.additionalPrice())
                        .displayOrder(itemReq.displayOrder() != null ? itemReq.displayOrder() : 0)
                        .status(itemReq.status() != null ? itemReq.status() : OptionItemStatus.AVAILABLE)
                        .build();
                optionGroup.addOptionItem(item);
            }
        }

        OptionGroup saved = optionGroupRepository.save(optionGroup);
        log.info("Created option group: id={}, name={}", saved.getId(), saved.getName());

        return OptionGroupResponse.fromEntity(saved);
    }

    @Transactional
    public OptionGroupResponse updateOptionGroup(UUID id, OptionGroupRequest request) {
        validateConstraints(request.isRequired(), request.minChoices(), request.maxChoices());

        OptionGroup optionGroup = optionGroupRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.OPTION_GROUP_NOT_FOUND));

        String newSlug = (request.slug() != null && !request.slug().isBlank())
                ? request.slug()
                : org.example.hakyfoodbackend.common.util.SlugUtil.toSlug(request.name());

        if (!newSlug.equals(optionGroup.getSlug()) && optionGroupRepository.existsBySlug(newSlug)) {
            throw new AppException(ErrorCode.OPTION_GROUP_SLUG_EXISTS);
        }

        optionGroup.setName(request.name());
        optionGroup.setSlug(newSlug);
        optionGroup.setDescription(request.description());
        optionGroup.setIsRequired(request.isRequired() != null ? request.isRequired() : false);
        optionGroup.setMinChoices(request.minChoices() != null ? request.minChoices() : 0);
        optionGroup.setMaxChoices(request.maxChoices() != null ? request.maxChoices() : 1);

        // Đồng bộ hóa danh sách nested items
        List<OptionItemRequest> itemRequests = request.optionItems() != null ? request.optionItems() : Collections.emptyList();
        
        // Nhóm các items hiện có theo ID để đối chiếu nhanh
        Map<UUID, OptionItem> existingItemsMap = optionGroup.getOptionItems().stream()
                .collect(Collectors.toMap(OptionItem::getId, item -> item));

        List<OptionItem> toRemove = new ArrayList<>();
        Set<UUID> processedIds = new HashSet<>();

        for (OptionItemRequest itemReq : itemRequests) {
            if (itemReq.id() != null && existingItemsMap.containsKey(itemReq.id())) {
                // Cập nhật item hiện có
                OptionItem existingItem = existingItemsMap.get(itemReq.id());
                existingItem.setName(itemReq.name());
                existingItem.setAdditionalPrice(itemReq.additionalPrice());
                existingItem.setDisplayOrder(itemReq.displayOrder() != null ? itemReq.displayOrder() : 0);
                existingItem.setStatus(itemReq.status() != null ? itemReq.status() : OptionItemStatus.AVAILABLE);
                processedIds.add(itemReq.id());
            } else {
                // Thêm mới item
                OptionItem newItem = OptionItem.builder()
                        .name(itemReq.name())
                        .additionalPrice(itemReq.additionalPrice())
                        .displayOrder(itemReq.displayOrder() != null ? itemReq.displayOrder() : 0)
                        .status(itemReq.status() != null ? itemReq.status() : OptionItemStatus.AVAILABLE)
                        .build();
                optionGroup.addOptionItem(newItem);
            }
        }

        // Tìm các item cũ không có trong request để xóa
        for (OptionItem existingItem : existingItemsMap.values()) {
            if (!processedIds.contains(existingItem.getId())) {
                toRemove.add(existingItem);
            }
        }

        // Thực hiện xóa bỏ
        for (OptionItem itemToRemove : toRemove) {
            optionGroup.removeOptionItem(itemToRemove);
        }

        OptionGroup saved = optionGroupRepository.save(optionGroup);
        log.info("Updated option group: id={}, name={}", saved.getId(), saved.getName());

        return OptionGroupResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteOptionGroup(UUID id) {
        OptionGroup optionGroup = optionGroupRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.OPTION_GROUP_NOT_FOUND));

        optionGroupRepository.delete(optionGroup);
        log.info("Deleted option group: id={}, name={}", id, optionGroup.getName());
    }

    @Transactional(readOnly = true)
    public OptionGroupResponse getOptionGroupById(UUID id) {
        OptionGroup optionGroup = optionGroupRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.OPTION_GROUP_NOT_FOUND));
        return OptionGroupResponse.fromEntity(optionGroup);
    }

    @Transactional(readOnly = true)
    public List<OptionGroupResponse> getAllOptionGroups() {
        return optionGroupRepository.findAll().stream()
                .map(OptionGroupResponse::fromEntity)
                .toList();
    }

    private void validateConstraints(Boolean isRequired, Integer minChoices, Integer maxChoices) {
        int min = minChoices != null ? minChoices : 0;
        int max = maxChoices != null ? maxChoices : 1;
        boolean required = isRequired != null ? isRequired : false;

        if (min > max) {
            throw new AppException(ErrorCode.OPTION_GROUP_INVALID_CONSTRAINTS);
        }

        if (required && min < 1) {
            throw new AppException(ErrorCode.OPTION_GROUP_INVALID_CONSTRAINTS);
        }
    }
}
