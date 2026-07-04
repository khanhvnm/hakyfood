package org.example.hakyfoodbackend.modules.menu.repository;

import org.example.hakyfoodbackend.modules.menu.entity.OptionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OptionGroupRepository extends JpaRepository<OptionGroup, UUID> {
    Optional<OptionGroup> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
