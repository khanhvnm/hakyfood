package org.example.hakyfoodbackend.modules.menu.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.common.util.SlugUtil;
import org.example.hakyfoodbackend.modules.menu.dto.FoodRequest;
import org.example.hakyfoodbackend.modules.menu.dto.FoodResponse;
import org.example.hakyfoodbackend.modules.menu.entity.Category;
import org.example.hakyfoodbackend.modules.menu.entity.Food;
import org.example.hakyfoodbackend.modules.menu.entity.OptionGroup;
import org.example.hakyfoodbackend.modules.menu.enums.FoodStatus;
import org.example.hakyfoodbackend.modules.menu.repository.CategoryRepository;
import org.example.hakyfoodbackend.modules.menu.repository.FoodRepository;
import org.example.hakyfoodbackend.modules.menu.repository.OptionGroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;
    private final CategoryRepository categoryRepository;
    private final OptionGroupRepository optionGroupRepository;

    @Transactional
    public FoodResponse createFood(FoodRequest request) {
        String slug = (request.slug() != null && !request.slug().isBlank())
                ? request.slug()
                : SlugUtil.toSlug(request.name());

        if (foodRepository.existsBySlug(slug)) {
            throw new AppException(ErrorCode.FOOD_SLUG_EXISTS);
        }

        Set<Category> categories = loadCategories(request.categoryIds());
        Set<OptionGroup> optionGroups = loadOptionGroups(request.optionGroupIds());

        Food food = Food.builder()
                .name(request.name())
                .slug(slug)
                .description(request.description())
                .imageUrl(request.imageUrl())
                .detailImageUrls(request.detailImageUrls())
                .basePrice(request.basePrice())
                .status(request.status() != null ? request.status() : FoodStatus.AVAILABLE)
                .categories(categories)
                .optionGroups(optionGroups)
                .build();

        Food saved = foodRepository.save(food);
        log.info("Created food: id={}, name={}", saved.getId(), saved.getName());

        return FoodResponse.fromEntity(saved);
    }

    @Transactional
    public FoodResponse updateFood(UUID id, FoodRequest request) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FOOD_NOT_FOUND));

        String newSlug = (request.slug() != null && !request.slug().isBlank())
                ? request.slug()
                : SlugUtil.toSlug(request.name());

        if (!newSlug.equals(food.getSlug()) && foodRepository.existsBySlug(newSlug)) {
            throw new AppException(ErrorCode.FOOD_SLUG_EXISTS);
        }

        Set<Category> categories = loadCategories(request.categoryIds());
        Set<OptionGroup> optionGroups = loadOptionGroups(request.optionGroupIds());

        food.setName(request.name());
        food.setSlug(newSlug);
        food.setDescription(request.description());
        food.setImageUrl(request.imageUrl());
        food.setDetailImageUrls(request.detailImageUrls());
        food.setBasePrice(request.basePrice());
        
        if (request.status() != null) {
            food.setStatus(request.status());
        }

        food.setCategories(categories);
        food.setOptionGroups(optionGroups);

        Food saved = foodRepository.save(food);
        log.info("Updated food: id={}, name={}", saved.getId(), saved.getName());

        return FoodResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteFood(UUID id) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FOOD_NOT_FOUND));

        foodRepository.delete(food);
        log.info("Deleted food: id={}, name={}", id, food.getName());
    }

    @Transactional(readOnly = true)
    public FoodResponse getFoodById(UUID id) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FOOD_NOT_FOUND));
        return FoodResponse.fromEntity(food);
    }

    @Transactional(readOnly = true)
    public List<FoodResponse> getAllFoods() {
        return foodRepository.findAll().stream()
                .map(FoodResponse::fromEntity)
                .toList();
    }

    private Set<Category> loadCategories(Set<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return new HashSet<>();
        }
        List<Category> categories = categoryRepository.findAllById(ids);
        if (categories.size() != ids.size()) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        return new HashSet<>(categories);
    }

    private Set<OptionGroup> loadOptionGroups(Set<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return new HashSet<>();
        }
        List<OptionGroup> groups = optionGroupRepository.findAllById(ids);
        if (groups.size() != ids.size()) {
            throw new AppException(ErrorCode.OPTION_GROUP_NOT_FOUND);
        }
        return new HashSet<>(groups);
    }
}
