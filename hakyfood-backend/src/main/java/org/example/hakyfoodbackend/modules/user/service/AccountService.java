package org.example.hakyfoodbackend.modules.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.modules.user.entity.Account;
import org.example.hakyfoodbackend.modules.user.entity.Role;
import org.example.hakyfoodbackend.modules.user.entity.User;
import org.example.hakyfoodbackend.modules.user.enums.AccountStatus;
import org.example.hakyfoodbackend.modules.user.enums.AuthProvider;
import org.example.hakyfoodbackend.modules.user.repository.AccountRepository;
import org.example.hakyfoodbackend.modules.user.repository.RoleRepository;
import org.example.hakyfoodbackend.modules.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UUID createLocalAccount(String email, String password) {
        Account account = accountRepository.findByEmail(email).orElse(null);

        if (account == null) {
            account = Account.builder()
                    .email(email)
                    .hashedPassword(passwordEncoder.encode(password))
                    .accountStatus(AccountStatus.PENDING_VERIFY)
                    .build();

            Role customerRole = roleRepository.findByCode("CUSTOMER")
                    .orElseThrow(() -> {
                        log.error("Register failed: Customer role not found");
                        return new AppException(ErrorCode.ROLE_NOT_FOUND);
                    });

            account.getRoles().add(customerRole);

            Account savedAccount = accountRepository.save(account);

            // Create empty User profile linked to the account
            User userProfile = User.builder()
                    .account(savedAccount)
                    .build();
            userRepository.save(userProfile);

            return savedAccount.getId();
        } else {
            if (account.getAccountStatus() == AccountStatus.PENDING_VERIFY) {
                log.info("Account {} re-registered, updating password for pending verification.", email);
                account.updatePassword(passwordEncoder.encode(password));
                return account.getId();
            } else {
                throw new AppException(ErrorCode.ACCOUNT_EXISTS);
            }
        }
    }

    @Transactional
    public void activateAccount(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> {
                    log.error("Account not found for activation: {}", accountId);
                    return new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
                });

        account.activateAccount();
        accountRepository.save(account);
    }

    public Account getAccountById(UUID id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
    }

    public Account getAccountByEmail(String email) {
        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
    }

    @Transactional
    public Account getOrCreateGoogleAccount(String email, String fullName, String avatarUrl) {
        Account account = accountRepository.findByEmail(email).orElse(null);

        if (account == null) {
            log.info("Creating new Google account: {}", email);
            Account newAccount = Account.builder()
                    .email(email)
                    .authProvider(AuthProvider.GOOGLE)
                    .accountStatus(AccountStatus.ACTIVE)
                    .build();

            Role customerRole = roleRepository.findByCode("CUSTOMER")
                    .orElseThrow(() -> {
                        log.error("Register failed: Customer role not found");
                        return new AppException(ErrorCode.ROLE_NOT_FOUND);
                    });

            newAccount.getRoles().add(customerRole);
            Account savedAccount = accountRepository.save(newAccount);

            // Create User profile with Google info
            User userProfile = User.builder()
                    .account(savedAccount)
                    .fullName(fullName)
                    .avatarUrl(avatarUrl)
                    .build();
            userRepository.save(userProfile);

            return savedAccount;
        } else {
            log.info("Google account login: {}", email);
            if (account.getAccountStatus() == AccountStatus.PENDING_VERIFY) {
                account.activateAccount();
                accountRepository.save(account);
            }
            return account;
        }
    }

    @Transactional
    public void updateAccountPassword(UUID accountId, String rawPassword) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        account.updatePassword(passwordEncoder.encode(rawPassword));
        accountRepository.save(account);
    }

}
