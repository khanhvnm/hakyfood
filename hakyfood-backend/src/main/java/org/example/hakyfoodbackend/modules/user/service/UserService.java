package org.example.hakyfoodbackend.modules.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.modules.user.entity.Role;
import org.example.hakyfoodbackend.modules.user.entity.User;
import org.example.hakyfoodbackend.modules.user.enums.AccountStatus;
import org.example.hakyfoodbackend.modules.user.enums.AuthProvider;
import org.example.hakyfoodbackend.modules.user.repository.RoleRepository;
import org.example.hakyfoodbackend.modules.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UUID createLocalUser(String email, String password) {
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = User.builder()
                    .email(email)
                    .hashedPassword(passwordEncoder.encode(password))
                    .accountStatus(AccountStatus.PENDING_VERIFY)
                    .build();

            Role customerRole = roleRepository.findByCode("CUSTOMER")
                    .orElseThrow(() -> {
                        log.error("Register failed: Customer role not found");
                        return new AppException(ErrorCode.ROLE_NOT_FOUND);
                    });

            user.getRoles().add(customerRole);

            User savedUser = userRepository.save(user);
            return savedUser.getId();
        } else {
            if (user.getAccountStatus() == AccountStatus.PENDING_VERIFY) {
                log.info("User {} re-registered, updating password for pending verification.", email);
                user.updatePassword(passwordEncoder.encode(password));
                return user.getId();
            } else {
                throw new AppException(ErrorCode.ACCOUNT_EXISTS);
            }
        }
    }

    @Transactional
    public void activateAccount(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);

        if (user != null) {
            user.activateAccount();
            userRepository.save(user);
        } else {
            log.error("User not found for activation: {}", userId);
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
    }

    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    @Transactional
    public User getOrCreateGoogleUser(String email, String fullName, String avatarUrl) {
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            log.info("Creating new Google user: {}", email);
            User newUser = User.builder()
                    .email(email)
                    .fullName(fullName)
                    .avatarUrl(avatarUrl)
                    .authProvider(AuthProvider.GOOGLE)
                    .accountStatus(AccountStatus.ACTIVE)
                    .hashedPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .build();

            Role customerRole = roleRepository.findByCode("CUSTOMER")
                    .orElseThrow(() -> {
                        log.error("Register failed: Customer role not found");
                        return new AppException(ErrorCode.ROLE_NOT_FOUND);
                    });

            newUser.getRoles().add(customerRole);
            return userRepository.save(newUser);
        } else {
            log.info("Google user login: {}", email);
            if (user.getAccountStatus() == AccountStatus.PENDING_VERIFY) {
                user.activateAccount();
                userRepository.save(user);
            }
            return user;
        }
    }

}
