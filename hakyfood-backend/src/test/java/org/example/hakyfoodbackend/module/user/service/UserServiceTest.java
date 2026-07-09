package org.example.hakyfoodbackend.module.user.service;

import org.example.hakyfoodbackend.common.exception.AppException;
import org.example.hakyfoodbackend.common.exception.ErrorCode;
import org.example.hakyfoodbackend.modules.user.entity.User;
import org.example.hakyfoodbackend.modules.user.repository.UserRepository;
import org.example.hakyfoodbackend.modules.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    // ==================== GET USER BY ID ====================

    @Test
    void shouldGetUserByIdSuccessfully() {
        // Arrange
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .phone("0987654321")
                .fullName("Test User")
                .avatarUrl("http://avatar.url")
                .build();
        ReflectionTestUtils.setField(user, "id", userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act
        User result = userService.getUserById(userId);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getId());
        assertEquals("Test User", result.getFullName());
        verify(userRepository).findById(userId);
    }

    @Test
    void shouldThrowExceptionWhenUserNotFoundById() {
        // Arrange
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> userService.getUserById(userId));

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository).findById(userId);
    }

    // ==================== UPDATE PROFILE ====================

    @Test
    void shouldUpdateProfileSuccessfully() {
        // Arrange
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .phone("0987654321")
                .fullName("Old Name")
                .avatarUrl("http://old-avatar.url")
                .build();
        ReflectionTestUtils.setField(user, "id", userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        // Act
        userService.updateProfile(userId, "New Name", "0123456789", "http://new-avatar.url");

        // Assert
        assertEquals("New Name", user.getFullName());
        assertEquals("0123456789", user.getPhone());
        assertEquals("http://new-avatar.url", user.getAvatarUrl());
        verify(userRepository).findById(userId);
        verify(userRepository).save(user);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistentUser() {
        // Arrange
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> userService.updateProfile(userId, "New Name", "0123456789", "http://new-avatar.url"));

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

}
