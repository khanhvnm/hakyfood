package org.example.hakyfoodbackend.module.user.service;

import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.modules.user.entity.Role;
import org.example.hakyfoodbackend.modules.user.entity.User;
import org.example.hakyfoodbackend.modules.user.enums.AccountStatus;
import org.example.hakyfoodbackend.modules.user.repository.RoleRepository;
import org.example.hakyfoodbackend.modules.user.repository.UserRepository;
import org.example.hakyfoodbackend.modules.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    // ==================== CREATE LOCAL USER ====================

    @Test
    void shouldCreateNewLocalUserSuccessfully() {
        // Arrange
        String email = "newuser@test.com";
        String rawPassword = "password123";
        String hashedPassword = "hashed_password";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(rawPassword)).thenReturn(hashedPassword);

        Role customerRole = Role.builder().code("CUSTOMER").name("Customer").build();
        when(roleRepository.findByCode("CUSTOMER")).thenReturn(Optional.of(customerRole));

        UUID generatedId = UUID.randomUUID();
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User userToSave = invocation.getArgument(0);
            ReflectionTestUtils.setField(userToSave, "id", generatedId);
            return userToSave;
        });

        // Act
        UUID userId = userService.createLocalUser(email, rawPassword);

        // Assert
        assertEquals(generatedId, userId);
        verify(userRepository).findByEmail(email);
        verify(passwordEncoder).encode(rawPassword);
        verify(roleRepository).findByCode("CUSTOMER");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenCustomerRoleNotFound() {
        // Arrange
        String email = "newuser@test.com";
        String rawPassword = "password123";
        String hashedPassword = "hashed_password";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(rawPassword)).thenReturn(hashedPassword);
        when(roleRepository.findByCode("CUSTOMER")).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> userService.createLocalUser(email, rawPassword));

        assertEquals(ErrorCode.ROLE_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldUpdatePasswordWhenUserIsPendingVerify() {
        // Arrange
        String email = "pending@test.com";
        String rawPassword = "newpassword123";
        String hashedNewPassword = "hashed_new_password";

        User existingPendingUser = User.builder()
                .email(email)
                .hashedPassword("old_hashed_password")
                .accountStatus(AccountStatus.PENDING_VERIFY)
                .build();
        ReflectionTestUtils.setField(existingPendingUser, "id", UUID.randomUUID());

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingPendingUser));
        when(passwordEncoder.encode(rawPassword)).thenReturn(hashedNewPassword);

        // Act
        UUID userId = userService.createLocalUser(email, rawPassword);

        // Assert
        assertEquals(existingPendingUser.getId(), userId);
        assertEquals(hashedNewPassword, existingPendingUser.getHashedPassword());
        verify(userRepository).findByEmail(email);
        verify(passwordEncoder).encode(rawPassword);
        verify(roleRepository, never()).findByCode(anyString());
        // For existing entities, we rely on Hibernate dirty checking, so userRepository.save is not called manually.
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenUserAlreadyExistsAndIsActive() {
        // Arrange
        String email = "active@test.com";
        String rawPassword = "password123";

        User existingActiveUser = User.builder()
                .email(email)
                .hashedPassword("hashed_password")
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingActiveUser));

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> userService.createLocalUser(email, rawPassword));

        assertEquals(ErrorCode.ACCOUNT_EXISTS, exception.getErrorCode());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    // ==================== ACTIVATE ACCOUNT ====================

    @Test
    void shouldActivateAccountSuccessfully() {
        // Arrange
        UUID userId = UUID.randomUUID();
        User pendingUser = User.builder()
                .email("pending@test.com")
                .accountStatus(AccountStatus.PENDING_VERIFY)
                .build();
        ReflectionTestUtils.setField(pendingUser, "id", userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(pendingUser));
        when(userRepository.save(any(User.class))).thenReturn(pendingUser);

        // Act
        userService.activateAccount(userId);

        // Assert
        assertEquals(AccountStatus.ACTIVE, pendingUser.getAccountStatus());
        verify(userRepository).findById(userId);
        verify(userRepository).save(pendingUser);
    }

    @Test
    void shouldThrowExceptionWhenActivatingUserNotFound() {
        // Arrange
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> userService.activateAccount(userId));

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenActivatingAlreadyActiveUser() {
        // Arrange
        UUID userId = UUID.randomUUID();
        User activeUser = User.builder()
                .email("active@test.com")
                .accountStatus(AccountStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(activeUser, "id", userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(activeUser));

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> userService.activateAccount(userId));

        assertEquals(ErrorCode.ACCOUNT_NOT_PENDING_VERIFY, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

}
