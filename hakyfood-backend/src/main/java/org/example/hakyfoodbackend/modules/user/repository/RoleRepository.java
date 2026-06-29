package org.example.hakyfoodbackend.modules.user.repository;

import org.example.hakyfoodbackend.modules.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByCode(String code);

}
