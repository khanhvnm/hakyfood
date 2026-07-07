package org.example.hakyfoodbackend.modules.menu.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.common.util.SlugUtil;
import org.example.hakyfoodbackend.modules.menu.dto.CategoryRequest;
import org.example.hakyfoodbackend.modules.menu.dto.CategoryResponse;
import org.example.hakyfoodbackend.modules.menu.entity.Category;
import org.example.hakyfoodbackend.modules.menu.enums.CategoryStatus;
import org.example.hakyfoodbackend.modules.menu.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        // Sinh slug tự động nếu không truyền
        String slug = (request.slug() != null && !request.slug().isBlank())
                ? request.slug()
                : SlugUtil.toSlug(request.name());

        // Kiểm tra trùng lặp slug
        if (categoryRepository.existsBySlug(slug)) {
            throw new AppException(ErrorCode.CATEGORY_SLUG_EXISTS);
        }

        // Tìm danh mục cha nếu có
        Category parent = null;
        if (request.parentId() != null) {
            parent = categoryRepository.findById(request.parentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        }

        Category category = Category.builder()
                .name(request.name())
                .slug(slug)
                .iconUrl(request.iconUrl())
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .status(request.status() != null ? request.status() : CategoryStatus.ACTIVE)
                .parent(parent)
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Created category: id={}, name={}, slug={}", saved.getId(), saved.getName(), saved.getSlug());

        return CategoryResponse.fromEntity(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Xử lý slug: sinh tự động hoặc kiểm tra trùng lặp
        String newSlug = (request.slug() != null && !request.slug().isBlank())
                ? request.slug()
                : SlugUtil.toSlug(request.name());

        if (!newSlug.equals(category.getSlug()) && categoryRepository.existsBySlug(newSlug)) {
            throw new AppException(ErrorCode.CATEGORY_SLUG_EXISTS);
        }

        // Xử lý cập nhật danh mục cha
        if (request.parentId() != null) {
            // Không được gán chính mình làm cha
            if (request.parentId().equals(id)) {
                throw new AppException(ErrorCode.CATEGORY_CIRCULAR_REFERENCE);
            }

            Category newParent = categoryRepository.findById(request.parentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

            // Kiểm tra vòng lặp đệ quy: duyệt ngược từ newParent lên gốc
            checkCircularReference(id, newParent);

            category.setParent(newParent);
        } else {
            // parentId = null nghĩa là đưa danh mục về cấp gốc
            category.setParent(null);
        }

        category.setName(request.name());
        category.setSlug(newSlug);
        category.setIconUrl(request.iconUrl());

        if (request.displayOrder() != null) {
            category.setDisplayOrder(request.displayOrder());
        }
        if (request.status() != null) {
            category.setStatus(request.status());
        }

        Category saved = categoryRepository.save(category);
        log.info("Updated category: id={}, name={}", saved.getId(), saved.getName());

        return CategoryResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Gỡ liên kết cha của các danh mục con trực tiếp (đưa chúng về cấp gốc)
        List<Category> children = categoryRepository.findByParentIdOrderByDisplayOrderAsc(id);
        for (Category child : children) {
            child.setParent(null);
        }
        categoryRepository.saveAll(children);

        categoryRepository.delete(category);
        log.info("Deleted category: id={}, name={}", id, category.getName());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree() {
        // Lấy tất cả categories phẳng bằng đúng 1 query duy nhất
        List<Category> allCategories = categoryRepository.findAll();

        Map<UUID, CategoryResponse> responseMap = new HashMap<>();
        Map<UUID, List<CategoryResponse>> childrenMap = new HashMap<>();

        // Khởi tạo DTO phẳng và các danh sách con trống cho tất cả categories
        for (Category category : allCategories) {
            List<CategoryResponse> childrenList = new ArrayList<>();
            childrenMap.put(category.getId(), childrenList);

            CategoryResponse catResponse = new CategoryResponse(
                    category.getId(),
                    category.getName(),
                    category.getSlug(),
                    category.getIconUrl(),
                    category.getDisplayOrder(),
                    category.getStatus(),
                    category.getParent() != null ? category.getParent().getId() : null,
                    childrenList,
                    category.getCreatedAt(),
                    category.getUpdatedAt()
            );

            responseMap.put(category.getId(), catResponse);
        }

        List<CategoryResponse> rootResponses = new ArrayList<>();

        // Dựng cấu trúc cây trong bộ nhớ
        for (Category category : allCategories) {
            CategoryResponse currentResponse = responseMap.get(category.getId());
            Category parent = category.getParent();

            if (parent == null) {
                // Danh mục gốc thực sự
                rootResponses.add(currentResponse);
            } else if (responseMap.containsKey(parent.getId())) {
                // Danh mục con có cha tồn tại, đưa vào children của cha tương ứng
                List<CategoryResponse> parentChildren = childrenMap.get(parent.getId());
                if (parentChildren != null) {
                    parentChildren.add(currentResponse);
                }
            }
        }

        // Sắp xếp các danh mục con đệ quy theo displayOrder
        for (List<CategoryResponse> children : childrenMap.values()) {
            children.sort(Comparator.comparingInt(CategoryResponse::displayOrder));
        }

        // Sắp xếp danh mục gốc theo displayOrder
        rootResponses.sort(Comparator.comparingInt(CategoryResponse::displayOrder));

        return rootResponses;
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return CategoryResponse.fromEntity(category);
    }

    // ========================
    // Private helper methods
    // ========================

    /**
     * Kiểm tra vòng lặp đệ quy khi cập nhật danh mục cha.
     * Duyệt ngược từ danh mục cha mới lên gốc; nếu gặp bất kỳ tổ tiên nào
     * có ID trùng với danh mục đang cập nhật, ném lỗi CATEGORY_CIRCULAR_REFERENCE.
     */
    private void checkCircularReference(UUID categoryId, Category newParent) {
        Category current = newParent;
        while (current != null) {
            if (current.getId().equals(categoryId)) {
                throw new AppException(ErrorCode.CATEGORY_CIRCULAR_REFERENCE);
            }
            current = current.getParent();
        }
    }
}
