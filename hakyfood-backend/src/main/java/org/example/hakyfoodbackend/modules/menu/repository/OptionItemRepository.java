package org.example.hakyfoodbackend.modules.menu.repository;

import org.example.hakyfoodbackend.modules.menu.entity.OptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OptionItemRepository extends JpaRepository<OptionItem, UUID> {

    List<OptionItem> findByOptionGroupIdOrderByDisplayOrderAsc(UUID optionGroupId);
}
