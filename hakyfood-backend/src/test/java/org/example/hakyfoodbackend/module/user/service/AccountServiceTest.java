package org.example.hakyfoodbackend.module.user.service;

import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.modules.user.entity.Account;
import org.example.hakyfoodbackend.modules.user.entity.Role;
import org.example.hakyfoodbackend.modules.user.entity.User;
import org.example.hakyfoodbackend.modules.user.enums.AccountStatus;
import org.example.hakyfoodbackend.modules.user.repository.AccountRepository;
import org.example.hakyfoodbackend.modules.user.repository.RoleRepository;
import org.example.hakyfoodbackend.modules.user.repository.UserRepository;
import org.example.hakyfoodbackend.modules.user.service.AccountService;
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
public class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AccountService accountService;

    // ==================== CREATE LOCAL ACCOUNT ====================

    @Test
    void shouldCreateNewLocalAccountSuccessfully() {
        // Arrange
        String email = "newuser@test.com";
        String rawPassword = "password123";
        String hashedPassword = "hashed_password";

        when(accountRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(rawPassword)).thenReturn(hashedPassword);

        Role customerRole = Role.builder().code("CUSTOMER").name("Customer").build();
        when(roleRepository.findByCode("CUSTOMER")).thenReturn(Optional.of(customerRole));

        UUID generatedId = UUID.randomUUID();
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> {
            Account accountToSave = invocation.getArgument(0);
            ReflectionTestUtils.setField(accountToSave, "id", generatedId);
            return accountToSave;
        });

        // Act
        UUID accountId = accountService.createLocalAccount(email, rawPassword);

        // Assert
        assertEquals(generatedId, accountId);
        verify(accountRepository).findByEmail(email);
        verify(passwordEncoder).encode(rawPassword);
        verify(roleRepository).findByCode("CUSTOMER");
        verify(accountRepository).save(any(Account.class));
        verify(userRepository).save(any(User.class)); // Verifying profile creation
    }

    @Test
    void shouldThrowExceptionWhenCustomerRoleNotFound() {
        // Arrange
        String email = "newuser@test.com";
        String rawPassword = "password123";
        String hashedPassword = "hashed_password";

        when(accountRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(rawPassword)).thenReturn(hashedPassword);
        when(roleRepository.findByCode("CUSTOMER")).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> accountService.createLocalAccount(email, rawPassword));

        assertEquals(ErrorCode.ROLE_NOT_FOUND, exception.getErrorCode());
        verify(accountRepository, never()).save(any(Account.class));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldUpdatePasswordWhenAccountIsPendingVerify() {
        // Arrange
        String email = "pending@test.com";
        String rawPassword = "newpassword123";
        String hashedNewPassword = "hashed_new_password";

        Account existingPendingAccount = Account.builder()
                .email(email)
                .hashedPassword("old_hashed_password")
                .accountStatus(AccountStatus.PENDING_VERIFY)
                .build();
        ReflectionTestUtils.setField(existingPendingAccount, "id", UUID.randomUUID());

        when(accountRepository.findByEmail(email)).thenReturn(Optional.of(existingPendingAccount));
        when(passwordEncoder.encode(rawPassword)).thenReturn(hashedNewPassword);

        // Act
        UUID accountId = accountService.createLocalAccount(email, rawPassword);

        // Assert
        assertEquals(existingPendingAccount.getId(), accountId);
        assertEquals(hashedNewPassword, existingPendingAccount.getHashedPassword());
        verify(accountRepository).findByEmail(email);
        verify(passwordEncoder).encode(rawPassword);
        verify(roleRepository, never()).findByCode(anyString());
        verify(accountRepository, never()).save(any(Account.class));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenAccountAlreadyExistsAndIsActive() {
        // Arrange
        String email = "active@test.com";
        String rawPassword = "password123";

        Account existingActiveAccount = Account.builder()
                .email(email)
                .hashedPassword("hashed_password")
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        when(accountRepository.findByEmail(email)).thenReturn(Optional.of(existingActiveAccount));

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> accountService.createLocalAccount(email, rawPassword));

        assertEquals(ErrorCode.ACCOUNT_EXISTS, exception.getErrorCode());
        verify(passwordEncoder, never()).encode(anyString());
        verify(accountRepository, never()).save(any(Account.class));
        verify(userRepository, never()).save(any(User.class));
    }

    // ==================== ACTIVATE ACCOUNT ====================

    @Test
    void shouldActivateAccountSuccessfully() {
        // Arrange
        UUID accountId = UUID.randomUUID();
        Account pendingAccount = Account.builder()
                .email("pending@test.com")
                .accountStatus(AccountStatus.PENDING_VERIFY)
                .build();
        ReflectionTestUtils.setField(pendingAccount, "id", accountId);

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(pendingAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(pendingAccount);

        // Act
        accountService.activateAccount(accountId);

        // Assert
        assertEquals(AccountStatus.ACTIVE, pendingAccount.getAccountStatus());
        verify(accountRepository).findById(accountId);
        verify(accountRepository).save(pendingAccount);
    }

    @Test
    void shouldThrowExceptionWhenActivatingAccountNotFound() {
        // Arrange
        UUID accountId = UUID.randomUUID();
        when(accountRepository.findById(accountId)).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> accountService.activateAccount(accountId));

        assertEquals(ErrorCode.ACCOUNT_NOT_FOUND, exception.getErrorCode());
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    void shouldThrowExceptionWhenActivatingAlreadyActiveAccount() {
        // Arrange
        UUID accountId = UUID.randomUUID();
        Account activeAccount = Account.builder()
                .email("active@test.com")
                .accountStatus(AccountStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(activeAccount, "id", accountId);

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(activeAccount));

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> accountService.activateAccount(accountId));

        assertEquals(ErrorCode.ACCOUNT_NOT_PENDING_VERIFY, exception.getErrorCode());
        verify(accountRepository, never()).save(any(Account.class));
    }

}
