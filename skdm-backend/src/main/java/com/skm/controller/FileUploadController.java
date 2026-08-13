package com.skm.controller;

import com.skm.entity.User;
import com.skm.repository.UserRepository;
import com.skm.response.ApiResponse;
import com.skm.upload.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "File Upload", description = "File upload APIs")
@SecurityRequirement(name = "bearerAuth")
public class FileUploadController {

    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

    @PostMapping("/profile-photo")
    @Operation(summary = "Upload profile photo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        String fileUrl = fileStorageService.storeFile(file, "profiles");
        user.setProfilePhotoUrl(fileUrl);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", fileUrl), "Profile photo uploaded successfully"));
    }

    @PostMapping("/document")
    @Operation(summary = "Upload a document (for admission)")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> uploadDocument(@RequestParam("file") MultipartFile file,
                                                          @AuthenticationPrincipal User user) {
        String fileUrl = fileStorageService.storeFile(file, "documents/" + user.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", fileUrl), "Document uploaded successfully"));
    }

    @PostMapping("/admin/image")
    @Operation(summary = "Upload an image (gallery, banner, etc.) (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> uploadImage(@RequestParam("file") MultipartFile file,
                                                       @RequestParam(defaultValue = "general") String type) {
        String fileUrl = fileStorageService.storeFile(file, type);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", fileUrl), "Image uploaded successfully"));
    }
}
