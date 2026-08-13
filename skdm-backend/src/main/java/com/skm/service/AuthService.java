package com.skm.service;

import com.skm.dto.UserDto;
import com.skm.request.*;
import com.skm.response.ApiResponse;

public interface AuthService {
    ApiResponse<?> signup(SignupRequest request);
    ApiResponse<?> login(LoginRequest request, String ipAddress);
    ApiResponse<?> refreshToken(String refreshToken);
    ApiResponse<?> logout(String refreshToken, Long userId);
    ApiResponse<?> forgotPassword(ForgotPasswordRequest request);
    ApiResponse<?> resetPassword(ResetPasswordRequest request);
    ApiResponse<?> changePassword(ChangePasswordRequest request, Long userId);
    ApiResponse<?> verifyEmail(String token, String email);
    ApiResponse<UserDto> getProfile(Long userId);
    ApiResponse<UserDto> updateProfile(UpdateProfileRequest request, Long userId);
    ApiResponse<?> deactivateAccount(Long userId);
}
