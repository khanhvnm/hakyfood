package org.example.hakyfoodbackend.modules.menu.repository;

import org.example.hakyfoodbackend.modules.menu.entity.Category;
import org.example.hakyfoodbackend.modules.menu.enums.CategoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    @Query("SELECT DISTINCT c FROM Category c " +
           "LEFT JOIN FETCH c.foods f " +
           "WHERE c.status = org.example.hakyfoodbackend.modules.menu.enums.CategoryStatus.ACTIVE " +
           "AND (f IS NULL OR f.status = org.example.hakyfoodbackend.modules.menu.enums.FoodStatus.AVAILABLE) " +
           "ORDER BY c.displayOrder ASC")
    List<Category> findAllActiveWithFoods();

    List<Category> findByParentIsNullOrderByDisplayOrderAsc();

    List<Category> findByParentIdOrderByDisplayOrderAsc(UUID parentId);

    List<Category> findByStatusOrderByDisplayOrderAsc(CategoryStatus status);

    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
