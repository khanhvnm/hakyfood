package org.example.hakyfoodbackend.modules.menu.repository;

import org.example.hakyfoodbackend.modules.menu.entity.Food;
import org.example.hakyfoodbackend.modules.menu.enums.FoodStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FoodRepository extends JpaRepository<Food, UUID> {

    @Query("SELECT DISTINCT f FROM Food f " +
           "LEFT JOIN FETCH f.optionGroups og " +
           "LEFT JOIN FETCH og.optionItems oi " +
           "WHERE f.id = :id AND f.status = org.example.hakyfoodbackend.modules.menu.enums.FoodStatus.AVAILABLE " +
           "AND (oi IS NULL OR oi.status = org.example.hakyfoodbackend.modules.menu.enums.OptionItemStatus.AVAILABLE)")
    Optional<Food> findActiveFoodByIdWithDetails(@Param("id") UUID id);

    List<Food> findByStatusOrderByNameAsc(FoodStatus status);

    Optional<Food> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
