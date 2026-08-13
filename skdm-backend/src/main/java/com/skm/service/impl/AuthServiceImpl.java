package com.skm.service.impl;

import com.skm.constants.AppConstants;
import com.skm.dto.UserDto;
import com.skm.entity.*;
import com.skm.exception.BadRequestException;
import com.skm.exception.DuplicateResourceException;
import com.skm.exception.ResourceNotFoundException;
import com.skm.jwt.JwtTokenProvider;
import com.skm.mail.EmailService;
import com.skm.repository.*;
import com.skm.request.*;
import com.skm.response.ApiResponse;
import com.skm.service.AuthService;
import com.skm.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ActivityLogService activityLogService;

    @Value("${app.email-verification.enabled:false}")
    private boolean emailVerificationEnabled;

    @Value("${app.otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    @Override
    public ApiResponse<?> signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email address already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("This username is already taken");
        }

        Role userRole = roleRepository.findByName(AppConstants.ROLE_USER)
                .orElseThrow(() -> new ResourceNotFoundException("Default role not found. Please contact admin."));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .roles(new HashSet<>(Set.of(userRole)))
                .active(true)
                .emailVerified(!emailVerificationEnabled)
                .build();

        userRepository.save(user);

        if (emailVerificationEnabled) {
            sendVerificationEmail(user);
        }

        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
        } catch (Exception e) {
            log.warn("Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }

        activityLogService.log(user, AppConstants.ACTION_REGISTER, "New user registered", "User", String.valueOf(user.getId()), null);

        log.info("New user registered: {} ({})", user.getUsername(), user.getEmail());
        return ApiResponse.created(mapToDto(user), "Account created successfully! You can now log in.");
    }

    @Override
    public ApiResponse<?> login(LoginRequest request, String ipAddress) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = (User) authentication.getPrincipal();

        if (user.isSuspended()) {
            throw new BadRequestException("Your account has been suspended: " + user.getSuspensionReason());
        }

        // Reset failed attempts on success
        userRepository.resetFailedAttempts(user.getId());
        userRepository.updateLastLogin(user.getId(), LocalDateTime.now(), ipAddress);

        // Revoke old refresh tokens for this user (clean up)
        refreshTokenRepository.revokeAllByUser(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        // Persist refresh token
        RefreshToken savedRefreshToken = RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshTokenExpiryMs() / 1000))
                .revoked(false)
                .build();
        refreshTokenRepository.save(savedRefreshToken);

        activityLogService.log(user, AppConstants.ACTION_LOGIN, "User logged in", null, null, ipAddress);

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("accessToken", accessToken);
        responseData.put("refreshToken", refreshToken);
        responseData.put("tokenType", "Bearer");
        responseData.put("expiresIn", 900);
        responseData.put("user", mapToDto(user));

        log.info("User logged in: {} from IP: {}", user.getEmail(), ipAddress);
        return ApiResponse.success(responseData, "Login successful");
    }

    @Override
    public ApiResponse<?> refreshToken(String refreshTokenStr) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (!storedToken.isValid()) {
            throw new BadRequestException("Refresh token has expired or been revoked. Please log in again.");
        }

        User user = storedToken.getUser();
        if (!user.isEnabled()) {
            throw new BadRequestException("User account is disabled");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(user);

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("accessToken", newAccessToken);
        responseData.put("tokenType", "Bearer");
        responseData.put("expiresIn", 900);

        return ApiResponse.success(responseData, "Token refreshed successfully");
    }

    @Override
    public ApiResponse<?> logout(String refreshTokenStr, Long userId) {
        if (refreshTokenStr != null && !refreshTokenStr.isBlank()) {
            refreshTokenRepository.revokeByToken(refreshTokenStr);
        }
        SecurityContextHolder.clearContext();

        userRepository.findByIdAndDeletedFalse(userId).ifPresent(user ->
                activityLogService.log(user, AppConstants.ACTION_LOGOUT, "User logged out", null, null, null));

        return ApiResponse.ok("Logged out successfully");
    }

    @Override
    public ApiResponse<?> forgotPassword(ForgotPasswordRequest request) {
        // Always return success to avoid email enumeration
        userRepository.findByEmailAndDeletedFalse(request.getEmail()).ifPresent(user -> {
            otpTokenRepository.invalidateAll(user.getEmail(), "PASSWORD_RESET");
            String otp = generateOtp();
            OtpToken otpToken = OtpToken.builder()
                    .email(user.getEmail())
                    .token(otp)
                    .purpose("PASSWORD_RESET")
                    .createdAt(LocalDateTime.now())
                    .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                    .used(false)
                    .build();
            otpTokenRepository.save(otpToken);

            try {
                emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), otp);
            } catch (Exception e) {
                log.error("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
            }
        });

        return ApiResponse.ok("If an account exists with this email, you will receive an OTP shortly.");
    }

    @Override
    public ApiResponse<?> resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        OtpToken otpToken = otpTokenRepository
                .findFirstByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(request.getEmail(), "PASSWORD_RESET")
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        if (!otpToken.isValid()) {
            throw new BadRequestException("OTP has expired or been used. Please request a new one.");
        }

        if (!otpToken.getToken().equals(request.getOtp())) {
            otpTokenRepository.incrementAttempts(otpToken.getId());
            throw new BadRequestException("Invalid OTP. Please check and try again.");
        }

        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        // Revoke all refresh tokens (force re-login)
        refreshTokenRepository.revokeAllByUser(user);

        activityLogService.log(user, AppConstants.ACTION_PASSWORD_RESET, "Password reset via OTP", "User", String.valueOf(user.getId()), null);

        return ApiResponse.ok("Password reset successfully. Please log in with your new password.");
    }

    @Override
    public ApiResponse<?> changePassword(ChangePasswordRequest request, Long userId) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        refreshTokenRepository.revokeAllByUser(user);

        return ApiResponse.ok("Password changed successfully. Please log in again.");
    }

    @Override
    public ApiResponse<?> verifyEmail(String token, String email) {
        OtpToken otpToken = otpTokenRepository
                .findFirstByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, "EMAIL_VERIFY")
                .orElseThrow(() -> new BadRequestException("Invalid verification link"));

        if (!otpToken.isValid() || !otpToken.getToken().equals(token)) {
            throw new BadRequestException("Verification link has expired. Please request a new one.");
        }

        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        user.setEmailVerified(true);
        userRepository.save(user);
        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        return ApiResponse.ok("Email verified successfully. You can now log in.");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<UserDto> getProfile(Long userId) {
        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return ApiResponse.success(mapToDto(user), "Profile retrieved successfully");
    }

    @Override
    public ApiResponse<UserDto> updateProfile(UpdateProfileRequest request, Long userId) {
        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getState() != null) user.setState(request.getState());
        if (request.getPincode() != null) user.setPincode(request.getPincode());

        userRepository.save(user);
        activityLogService.log(user, AppConstants.ACTION_PROFILE_UPDATE, "Profile updated", "User", String.valueOf(user.getId()), null);

        return ApiResponse.success(mapToDto(user), "Profile updated successfully");
    }

    @Override
    public ApiResponse<?> deactivateAccount(Long userId) {
        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setActive(false);
        userRepository.save(user);
        refreshTokenRepository.revokeAllByUser(user);
        return ApiResponse.ok("Account deactivated successfully.");
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .studentId(user.getStudentId())
                .courseName(user.getCourseName())
                .currentSemester(user.getCurrentSemester() != null ? user.getCurrentSemester() : "Semester 1")
                .totalFee(user.getTotalFee() != null ? user.getTotalFee() : 0.0)
                .paidFee(user.getPaidFee() != null ? user.getPaidFee() : 0.0)
                .remainingFee(user.getRemainingFee() != null ? user.getRemainingFee() : 0.0)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .address(user.getAddress())
                .city(user.getCity())
                .state(user.getState())
                .pincode(user.getPincode())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .active(user.isActive())
                .emailVerified(user.isEmailVerified())
                .suspended(user.isSuspended())
                .lastLoginAt(user.getLastLoginAt())
                .roles(user.getAuthorities().stream()
                        .map(a -> a.getAuthority())
                        .collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private void sendVerificationEmail(User user) {
        String otp = generateOtp();
        OtpToken token = OtpToken.builder()
                .email(user.getEmail())
                .token(otp)
                .purpose("EMAIL_VERIFY")
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .used(false)
                .build();
        otpTokenRepository.save(token);
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), otp);
        } catch (Exception e) {
            log.warn("Failed to send verification email: {}", e.getMessage());
        }
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
