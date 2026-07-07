package org.example.hakyfoodbackend.modules.menu.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.modules.menu.dto.ClientFoodDetailResponse;
import org.example.hakyfoodbackend.modules.menu.dto.ClientMenuCategoryResponse;
import org.example.hakyfoodbackend.modules.menu.dto.ClientMenuFoodResponse;
import org.example.hakyfoodbackend.modules.menu.entity.Category;
import org.example.hakyfoodbackend.modules.menu.entity.Food;
import org.example.hakyfoodbackend.modules.menu.repository.CategoryRepository;
import org.example.hakyfoodbackend.modules.menu.repository.FoodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuClientService {

    private final CategoryRepository categoryRepository;
    private final FoodRepository foodRepository;

    @Transactional(readOnly = true)
    public List<ClientMenuCategoryResponse> getClientMenu() {
        // Tải toàn bộ Active Categories kèm Available Foods của chúng trong 1 câu SQL duy nhất
        List<Category> activeCategories = categoryRepository.findAllActiveWithFoods();

        // Tạo Map lưu các response tương ứng của từng Category ID
        Map<UUID, ClientMenuCategoryResponse> responseMap = new HashMap<>();
        Map<UUID, List<ClientMenuCategoryResponse>> childrenMap = new HashMap<>();

        // Khởi tạo DTO phẳng cho tất cả active categories
        for (Category category : activeCategories) {
            List<ClientMenuFoodResponse> foods = category.getFoods() != null
                    ? category.getFoods().stream()
                        .map(ClientMenuFoodResponse::fromEntity)
                        .toList()
                    : List.of();

            List<ClientMenuCategoryResponse> childrenList = new ArrayList<>();
            childrenMap.put(category.getId(), childrenList);

            ClientMenuCategoryResponse catResponse = new ClientMenuCategoryResponse(
                    category.getId(),
                    category.getName(),
                    category.getSlug(),
                    category.getIconUrl(),
                    category.getDisplayOrder(),
                    foods,
                    childrenList
            );

            responseMap.put(category.getId(), catResponse);
        }

        List<ClientMenuCategoryResponse> rootResponses = new ArrayList<>();

        // Dựng cây phân cấp danh mục trong bộ nhớ
        for (Category category : activeCategories) {
            ClientMenuCategoryResponse currentResponse = responseMap.get(category.getId());
            Category parent = category.getParent();

            if (parent == null) {
                // Là danh mục gốc thực sự
                rootResponses.add(currentResponse);
            } else if (responseMap.containsKey(parent.getId())) {
                // Là danh mục con có danh mục cha ACTIVE, đưa vào children của cha tương ứng
                List<ClientMenuCategoryResponse> parentChildren = childrenMap.get(parent.getId());
                if (parentChildren != null) {
                    parentChildren.add(currentResponse);
                }
            }
            // Nếu cha bị INACTIVE (không có trong responseMap), ta discard toàn bộ nhánh con này
        }

        // Sắp xếp các danh mục con đệ quy theo displayOrder
        for (List<ClientMenuCategoryResponse> children : childrenMap.values()) {
            children.sort(Comparator.comparingInt(ClientMenuCategoryResponse::displayOrder));
        }

        // Sắp xếp danh mục gốc theo displayOrder
        rootResponses.sort(Comparator.comparingInt(ClientMenuCategoryResponse::displayOrder));

        log.info("Client menu tree assembled in-memory with {} root categories", rootResponses.size());
        return rootResponses;
    }

    @Transactional(readOnly = true)
    public ClientFoodDetailResponse getClientFoodDetail(UUID id) {
        // Tải chi tiết món ăn kèm các options được nạp sẵn chỉ trong 1 câu SQL
        Food food = foodRepository.findActiveFoodByIdWithDetails(id)
                .orElseThrow(() -> new AppException(ErrorCode.FOOD_NOT_FOUND));

        return ClientFoodDetailResponse.fromEntity(food);
    }
}
