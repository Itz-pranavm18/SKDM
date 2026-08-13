package com.skm.service;

import com.skm.constants.AppConstants;
import com.skm.dto.UserDto;
import com.skm.entity.Role;
import com.skm.entity.User;
import com.skm.exception.DuplicateResourceException;
import com.skm.mail.EmailService;
import com.skm.repository.*;
import com.skm.request.SignupRequest;
import com.skm.response.ApiResponse;
import com.skm.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private OtpTokenRepository otpTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;
    @Mock private ActivityLogService activityLogService;

    @InjectMocks
    private AuthServiceImpl authService;

    private SignupRequest signupRequest;
    private Role userRole;

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest("John", "Doe", "johndoe", "john@example.com", "Password@123", "9876543210");
        userRole = Role.builder().id(1L).name(AppConstants.ROLE_USER).build();
    }

    @Test
    @DisplayName("Should successfully signup a new user")
    void testSignupSuccess() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("johndoe")).thenReturn(false);
        when(roleRepository.findByName(AppConstants.ROLE_USER)).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        ApiResponse<?> response = authService.signup(signupRequest);

        assertNotNull(response);
        assertEquals(201, response.getStatus());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when email exists")
    void testSignupDuplicateEmail() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.signup(signupRequest));
        verify(userRepository, never()).save(any());
    }
}
