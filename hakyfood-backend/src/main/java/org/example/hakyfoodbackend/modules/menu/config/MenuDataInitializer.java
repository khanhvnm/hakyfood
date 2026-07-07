package org.example.hakyfoodbackend.modules.menu.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hakyfoodbackend.common.util.JsonUtil;
import org.example.hakyfoodbackend.modules.menu.entity.Category;
import org.example.hakyfoodbackend.modules.menu.entity.Food;
import org.example.hakyfoodbackend.modules.menu.entity.OptionGroup;
import org.example.hakyfoodbackend.modules.menu.entity.OptionItem;
import org.example.hakyfoodbackend.modules.menu.enums.FoodStatus;
import org.example.hakyfoodbackend.modules.menu.enums.OptionItemStatus;
import org.example.hakyfoodbackend.modules.menu.repository.CategoryRepository;
import org.example.hakyfoodbackend.modules.menu.repository.FoodRepository;
import org.example.hakyfoodbackend.modules.menu.repository.OptionGroupRepository;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class MenuDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final FoodRepository foodRepository;
    private final OptionGroupRepository optionGroupRepository;

    @Override
    @Transactional
    public void run(String @NonNull ... args) {
        log.info("=== Starting Menu Database Initialization... ===");

        // 1. Tải toàn bộ dữ liệu hiện có lên bộ nhớ (chỉ tốn 3 query SELECT)
        Map<String, Category> categoryCache = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getSlug, Function.identity()));

        Map<String, Food> foodCache = foodRepository.findAll().stream()
                .collect(Collectors.toMap(Food::getSlug, Function.identity()));

        Map<String, OptionGroup> optionGroupCache = optionGroupRepository.findAll().stream()
                .collect(Collectors.toMap(OptionGroup::getSlug, Function.identity()));

        // 2. Chỉ thực hiện init nếu DB chưa có dữ liệu danh mục
        if (categoryCache.isEmpty()) {
            initializeOptionGroups(optionGroupCache);
            initializeCategories(categoryCache);
            initializeFoods(categoryCache, foodCache, optionGroupCache);
            log.info("=== Menu Database Initialization Completed. ===");
        } else {
            log.info("=== Menu Database already contains data. Skipping initialization. ===");
        }
    }

    private void initializeOptionGroups(Map<String, OptionGroup> optionGroupCache) {
        log.info("Initializing option groups from JSON...");
        List<OptionGroupInfo> optionGroupInfos = JsonUtil.convertJsonToList(
                "/data/option-groups-v1.json",
                OptionGroupInfo[].class
        );
        for (OptionGroupInfo ogInfo : optionGroupInfos) {
            if (!optionGroupCache.containsKey(ogInfo.slug())) {
                OptionGroup optionGroup = OptionGroup.builder()
                        .name(ogInfo.name())
                        .slug(ogInfo.slug())
                        .description(ogInfo.description())
                        .isRequired(ogInfo.isRequired() != null ? ogInfo.isRequired() : false)
                        .minChoices(ogInfo.minChoices() != null ? ogInfo.minChoices() : 0)
                        .maxChoices(ogInfo.maxChoices() != null ? ogInfo.maxChoices() : 1)
                        .build();

                if (ogInfo.optionItems() != null) {
                    for (OptionItemInfo itemInfo : ogInfo.optionItems()) {
                        OptionItem item = OptionItem.builder()
                                .name(itemInfo.name())
                                .additionalPrice(itemInfo.additionalPrice() != null ? itemInfo.additionalPrice() : BigDecimal.ZERO)
                                .displayOrder(itemInfo.displayOrder() != null ? itemInfo.displayOrder() : 0)
                                .status(itemInfo.status() != null ? itemInfo.status() : OptionItemStatus.AVAILABLE)
                                .build();
                        optionGroup.addOptionItem(item);
                    }
                }

                OptionGroup savedGroup = optionGroupRepository.save(optionGroup);
                optionGroupCache.put(savedGroup.getSlug(), savedGroup); // Đưa vào cache
            }
        }
    }

    private void initializeCategories(Map<String, Category> categoryCache) {
        log.info("Initializing categories from JSON...");
        List<CategoryInfo> categoryInfos = JsonUtil.convertJsonToList(
                "/data/categories-v1.json",
                CategoryInfo[].class
        );
        for (CategoryInfo ci : categoryInfos) {
            saveCategoryRecursive(ci, null, categoryCache);
        }
    }

    private void saveCategoryRecursive(CategoryInfo ci, Category parent, Map<String, Category> categoryCache) {
        Category category = categoryCache.get(ci.slug());
        if (category == null) {
            Category newCat = Category.builder()
                    .name(ci.name())
                    .slug(ci.slug())
                    .iconUrl(ci.iconUrl())
                    .displayOrder(ci.displayOrder())
                    .parent(parent)
                    .build();
            category = categoryRepository.save(newCat);
            categoryCache.put(category.getSlug(), category); // Đưa vào cache
        }

        if (ci.children() != null) {
            for (CategoryInfo childInfo : ci.children()) {
                saveCategoryRecursive(childInfo, category, categoryCache);
            }
        }
    }

    private void initializeFoods(Map<String, Category> categoryCache, Map<String, Food> foodCache, Map<String, OptionGroup> optionGroupCache) {
        log.info("Initializing foods from JSON...");
        List<FoodInfo> foodInfos = JsonUtil.convertJsonToList(
                "/data/foods-v1.json",
                FoodInfo[].class
        );
        for (FoodInfo fi : foodInfos) {
            if (!foodCache.containsKey(fi.slug())) {
                // Ánh xạ danh mục hoàn toàn bằng in-memory cache
                Set<Category> cats = new HashSet<>();
                if (fi.categories() != null) {
                    for (String catSlug : fi.categories()) {
                        Category cat = categoryCache.get(catSlug);
                        if (cat != null) {
                            cats.add(cat);
                        }
                    }
                }

                // Ánh xạ OptionGroup hoàn toàn bằng in-memory cache
                Set<OptionGroup> ogs = new HashSet<>();
                if (fi.optionGroups() != null) {
                    for (String ogSlug : fi.optionGroups()) {
                        OptionGroup og = optionGroupCache.get(ogSlug);
                        if (og != null) {
                            ogs.add(og);
                        }
                    }
                }

                Food food = Food.builder()
                        .name(fi.name())
                        .slug(fi.slug())
                        .description(fi.description())
                        .imageUrl(fi.primaryImageUrl())
                        .videoUrl(fi.videoUrl())
                        .detailImageUrls(fi.detailImageUrls())
                        .basePrice(fi.basePrice())
                        .status(FoodStatus.AVAILABLE)
                        .categories(cats)
                        .optionGroups(ogs)
                        .build();

                Food savedFood = foodRepository.save(food);
                foodCache.put(savedFood.getSlug(), savedFood); // Đưa vào cache
            }
        }
    }

    private record OptionGroupInfo(
            String name,
            String slug,
            String description,
            Boolean isRequired,
            Integer minChoices,
            Integer maxChoices,
            List<OptionItemInfo> optionItems
    ) {}

    private record OptionItemInfo(
            String name,
            BigDecimal additionalPrice,
            Integer displayOrder,
            OptionItemStatus status
    ) {}

    private record CategoryInfo(
            String name,
            String slug,
            String iconUrl,
            Integer displayOrder,
            List<CategoryInfo> children
    ) {}

    private record FoodInfo(
            String name,
            String slug,
            String description,
            String primaryImageUrl,
            String videoUrl,
            List<String> detailImageUrls,
            BigDecimal basePrice,
            List<String> categories,
            List<String> optionGroups
    ) {}
}
