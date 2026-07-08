package org.example.hakyfoodbackend.modules.user.repository;

import org.example.hakyfoodbackend.modules.user.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    Optional<Account> findByEmail(String email);

}
