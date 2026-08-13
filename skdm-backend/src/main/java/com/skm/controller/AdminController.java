package com.skm.controller;

import com.skm.dto.*;
import com.skm.entity.*;
import com.skm.exception.ResourceNotFoundException;
import com.skm.repository.*;
import com.skm.response.ApiResponse;
import com.skm.response.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.skm.mail.EmailService;
import com.skm.service.impl.FeeManagementService;
import org.springframework.util.StringUtils;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Dashboard & User Management", description = "Admin dashboard, statistics, and user management APIs")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserRepository userRepository;
    private final AdmissionRepository admissionRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final FeePaymentRequestRepository feePaymentRequestRepository;
    private final FeeManagementService feeManagementService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // ── Dashboard ─────────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<ApiResponse<?>> getDashboard() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.countByDeletedFalse());
        stats.put("activeUsers", userRepository.countByDeletedFalseAndActive(true));
        
        long activeAdmissionsCount = admissionRepository.countByDeletedFalseAndUserDeletedFalse();
        long activeStudentUsersCount = userRepository.countByDeletedFalseAndStudentIdNotNull();
        long totalAdmissions = Math.max(activeAdmissionsCount, activeStudentUsersCount);
        stats.put("totalAdmissions", totalAdmissions);
        
        stats.put("pendingAdmissions", admissionRepository.countByStatusAndDeletedFalse("PENDING"));
        stats.put("approvedAdmissions", admissionRepository.countByStatusAndDeletedFalse("APPROVED"));
        stats.put("rejectedAdmissions", admissionRepository.countByStatusAndDeletedFalse("REJECTED"));
        stats.put("unreadMessages", contactMessageRepository.countByDeletedFalseAndStatus("UNREAD"));
        stats.put("pendingFeeVerifications", feePaymentRequestRepository.countByStatusAndDeletedFalse("PENDING"));

        // Status distribution
        List<Object[]> statusGroups = admissionRepository.countByStatusGrouped();
        Map<String, Long> admissionByStatus = new LinkedHashMap<>();
        statusGroups.forEach(row -> admissionByStatus.put((String) row[0], (Long) row[1]));
        stats.put("admissionByStatus", admissionByStatus);

        // Latest registrations
        List<Map<String, Object>> latestUsers = userRepository.findAll(
                PageRequest.of(0, 5, Sort.by("createdAt").descending()))
                .getContent().stream()
                .filter(u -> !u.isDeleted())
                .map(u -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", u.getId());
                    m.put("name", u.getFullName());
                    m.put("email", u.getEmail());
                    m.put("createdAt", u.getCreatedAt());
                    return m;
                }).collect(Collectors.toList());
        stats.put("latestRegistrations", latestUsers);

        // Recent activity
        List<ActivityLog> recentActivity = activityLogRepository.findTop20ByOrderByPerformedAtDesc();
        List<ActivityLogDto> activityDtos = recentActivity.stream().map(a -> ActivityLogDto.builder()
                .id(a.getId())
                .username(a.getUsername())
                .action(a.getAction())
                .description(a.getDescription())
                .ipAddress(a.getIpAddress())
                .performedAt(a.getPerformedAt())
                .status(a.getStatus())
                .build()).collect(Collectors.toList());
        stats.put("recentActivity", activityDtos);

        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard data retrieved successfully"));
    }

    // ── User management ───────────────────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "Get all users with search/filter")
    public ResponseEntity<ApiResponse<?>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean suspended,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<User> userPage = userRepository.searchUsers(search, active, suspended, pageable);
        Page<UserDto> dtoPage = userPage.map(this::mapUserToDto);
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(dtoPage), "Users retrieved"));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<?>> getUserById(@PathVariable Long id) {
        User user = userRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return ResponseEntity.ok(ApiResponse.success(mapUserToDto(user), "User retrieved"));
    }

    @PatchMapping("/users/{id}/suspend")
    @Operation(summary = "Suspend a user account")
    public ResponseEntity<ApiResponse<?>> suspendUser(@PathVariable Long id,
                                                       @RequestBody Map<String, String> body) {
        User user = userRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setSuspended(true);
        user.setSuspensionReason(body.getOrDefault("reason", "Suspended by admin"));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("User suspended successfully"));
    }

    @PatchMapping("/users/{id}/activate")
    @Operation(summary = "Activate a suspended user account")
    public ResponseEntity<ApiResponse<?>> activateUser(@PathVariable Long id) {
        User user = userRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setSuspended(false);
        user.setSuspensionReason(null);
        user.setActive(true);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("User activated successfully"));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Soft-delete a user account")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable Long id,
                                                      @AuthenticationPrincipal User admin) {
        if (id.equals(admin.getId())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "You cannot delete your own account", null));
        }
        User user = userRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.softDelete();
        userRepository.save(user);

        // Also soft-delete associated admissions
        List<Admission> userAdmissions = admissionRepository.findByUserIdOrderByCreatedAtDesc(id);
        if (!userAdmissions.isEmpty()) {
            for (Admission a : userAdmissions) {
                a.setDeleted(true);
            }
            admissionRepository.saveAll(userAdmissions);
        }

        return ResponseEntity.ok(ApiResponse.ok("User deleted successfully"));
    }

    @PatchMapping("/users/{id}/reset-password")
    @Operation(summary = "Admin reset user password")
    public ResponseEntity<ApiResponse<?>> adminResetPassword(@PathVariable Long id,
                                                              @RequestBody Map<String, String> body) {
        User user = userRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        String newPassword = body.getOrDefault("newPassword", "Temp@1234");
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully"));
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Assign role to user")
    public ResponseEntity<ApiResponse<?>> assignRole(@PathVariable Long id,
                                                      @RequestBody Map<String, String> body) {
        User user = userRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        String roleName = body.get("role");
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));
        user.getRoles().add(role);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Role assigned successfully"));
    }

    // ── Contact messages ──────────────────────────────────────────────────────

    @GetMapping("/contact-messages")
    @Operation(summary = "Get all contact messages")
    public ResponseEntity<ApiResponse<?>> getContactMessages(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ContactMessage> msgs = status != null
                ? contactMessageRepository.findByDeletedFalseAndStatusOrderByCreatedAtDesc(status, pageable)
                : contactMessageRepository.findByDeletedFalseOrderByCreatedAtDesc(pageable);
        Page<ContactMessageDto> dtos = msgs.map(m -> ContactMessageDto.builder()
                .id(m.getId()).fullName(m.getFullName()).email(m.getEmail())
                .phone(m.getPhone()).subject(m.getSubject()).message(m.getMessage())
                .status(m.getStatus()).reply(m.getReply()).repliedBy(m.getRepliedBy())
                .createdAt(m.getCreatedAt()).build());
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(dtos), "Messages retrieved"));
    }

    @PatchMapping("/contact-messages/{id}/mark-read")
    @Operation(summary = "Mark contact message as read")
    public ResponseEntity<ApiResponse<?>> markRead(@PathVariable Long id) {
        ContactMessage msg = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message", "id", id));
        msg.setStatus("READ");
        contactMessageRepository.save(msg);
        return ResponseEntity.ok(ApiResponse.ok("Marked as read"));
    }

    @DeleteMapping("/contact-messages/{id}")
    @Operation(summary = "Soft-delete a contact message")
    public ResponseEntity<ApiResponse<?>> deleteContactMessage(@PathVariable Long id) {
        ContactMessage msg = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message", "id", id));
        msg.softDelete();
        contactMessageRepository.save(msg);
        return ResponseEntity.ok(ApiResponse.ok("Contact message deleted successfully"));
    }

    @PostMapping("/contact-messages/{id}/reply")
    @Operation(summary = "Reply to a contact message")
    public ResponseEntity<ApiResponse<?>> replyToContactMessage(@PathVariable Long id,
                                                                 @RequestBody Map<String, String> body,
                                                                 @AuthenticationPrincipal User admin) {
        ContactMessage msg = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message", "id", id));
        String replyText = body.get("reply");
        if (!StringUtils.hasText(replyText)) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Reply text cannot be empty", null));
        }
        msg.setReply(replyText);
        msg.setRepliedBy(admin != null ? admin.getUsername() : "Admin");
        msg.setStatus("REPLIED");
        contactMessageRepository.save(msg);

        try {
            emailService.sendContactReply(msg.getEmail(), msg.getFullName(), msg.getSubject(), replyText);
        } catch (Exception e) {
            log.warn("Failed to send reply email to {}: {}", msg.getEmail(), e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.ok("Reply sent successfully to " + msg.getEmail()));
    }

    // ── Activity logs ─────────────────────────────────────────────────────────

    @GetMapping("/activity-logs")
    @Operation(summary = "Get activity logs")
    public ResponseEntity<ApiResponse<?>> getActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logs = activityLogRepository.findByOrderByPerformedAtDesc(pageable);
        Page<ActivityLogDto> dtos = logs.map(a -> ActivityLogDto.builder()
                .id(a.getId()).username(a.getUsername()).action(a.getAction())
                .description(a.getDescription()).ipAddress(a.getIpAddress())
                .performedAt(a.getPerformedAt()).status(a.getStatus()).build());
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(dtos), "Logs retrieved"));
    }

    // ── Fee Structure Management ───────────────────────────────────────────────

    @GetMapping("/fee-structures")
    @Operation(summary = "Get all course fee structures per semester")
    public ResponseEntity<ApiResponse<List<FeeStructureDto>>> getFeeStructures() {
        return ResponseEntity.ok(ApiResponse.success(feeManagementService.getAllFeeStructures(), "Fee structures retrieved"));
    }

    @PutMapping("/fee-structures/{id}")
    @Operation(summary = "Update fee amounts for a course and semester structure")
    public ResponseEntity<ApiResponse<FeeStructureDto>> updateFeeStructure(
            @PathVariable Long id,
            @RequestBody FeeStructureDto dto) {
        return ResponseEntity.ok(ApiResponse.success(feeManagementService.updateFeeStructure(id, dto), "Fee structure updated successfully"));
    }

    // ── Filtered Student Management (by Course & Semester) ─────────────────────

    @GetMapping("/students-filtered")
    @Operation(summary = "Get students filtered by Course (BA/BSC) and Semester (Semester 1-6)")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStudentsByCourseAndSemester(
            @RequestParam(defaultValue = "BA") String course,
            @RequestParam(defaultValue = "Semester 1") String semester) {
        List<Map<String, Object>> students = feeManagementService.getStudentsByCourseAndSemester(course, semester);
        return ResponseEntity.ok(ApiResponse.success(students, "Students retrieved for " + course + " " + semester));
    }

    // ── Student Promotion System ────────────────────────────────────────────────

    @PostMapping("/students/{userId}/promote")
    @Operation(summary = "Promote student to next semester")
    public ResponseEntity<ApiResponse<?>> promoteStudent(@PathVariable Long userId) {
        User updated = feeManagementService.promoteStudent(userId);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", updated.getId());
        data.put("studentId", updated.getStudentId());
        data.put("courseName", updated.getCourseName());
        data.put("currentSemester", updated.getCurrentSemester());
        return ResponseEntity.ok(ApiResponse.success(data, "Student promoted successfully to " + updated.getCurrentSemester()));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private UserDto mapUserToDto(User u) {
        return UserDto.builder()
                .id(u.getId()).username(u.getUsername()).email(u.getEmail())
                .studentId(u.getStudentId()).courseName(u.getCourseName())
                .currentSemester(u.getCurrentSemester() != null ? u.getCurrentSemester() : "Semester 1")
                .totalFee(u.getTotalFee() != null ? u.getTotalFee() : 0.0)
                .paidFee(u.getPaidFee() != null ? u.getPaidFee() : 0.0)
                .remainingFee(u.getRemainingFee() != null ? u.getRemainingFee() : 0.0)
                .firstName(u.getFirstName()).lastName(u.getLastName()).fullName(u.getFullName())
                .phone(u.getPhone()).active(u.isActive()).emailVerified(u.isEmailVerified())
                .suspended(u.isSuspended()).suspensionReason(u.getSuspensionReason())
                .lastLoginAt(u.getLastLoginAt())
                .roles(u.getAuthorities().stream().map(a -> a.getAuthority()).collect(Collectors.toSet()))
                .createdAt(u.getCreatedAt()).updatedAt(u.getUpdatedAt())
                .build();
    }
}
