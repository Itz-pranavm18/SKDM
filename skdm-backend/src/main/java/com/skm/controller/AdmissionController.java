package com.skm.controller;

import com.skm.entity.User;
import com.skm.request.AdmissionRequest;
import com.skm.request.FeePaymentSubmissionRequest;
import com.skm.request.NewAdmissionRequest;
import com.skm.response.ApiResponse;
import com.skm.service.impl.AdmissionService;
import com.skm.service.impl.FeeManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Admissions & Fees", description = "Student Admission & Fee Management APIs")
public class AdmissionController {

    private final AdmissionService admissionService;
    private final FeeManagementService feeManagementService;

    // ── Admin: Create New Admission ──────────────────────────────────────────
    @PostMapping("/admin/admissions/create")
    @Operation(summary = "Admin admit new student & create login credentials", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> createStudentAdmission(@Valid @RequestBody NewAdmissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(admissionService.createStudentAdmission(request));
    }

    // ── Admin: Edit Student Record ───────────────────────────────────────────
    @PutMapping("/admin/students/{userId}")
    @Operation(summary = "Admin edit student record details", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> updateStudentDetails(@PathVariable Long userId,
                                                                @Valid @RequestBody NewAdmissionRequest request) {
        return ResponseEntity.ok(admissionService.updateStudentDetails(userId, request));
    }

    // ── Admin: Delete Student Record Permanently ──────────────────────────────
    @DeleteMapping("/admin/students/{userId}")
    @Operation(summary = "Admin permanently delete student record and associated fee data", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> deleteStudentPermanently(@PathVariable Long userId) {
        return ResponseEntity.ok(admissionService.deleteStudentPermanently(userId));
    }

    // ── Admin: Fee Verification Endpoints ─────────────────────────────────────
    @GetMapping("/admin/fee-verifications")
    @Operation(summary = "Get all pending fee payment requests", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getPendingFeeVerifications() {
        return ResponseEntity.ok(admissionService.getPendingFeeVerifications());
    }

    @PatchMapping("/admin/fee-verifications/{id}/verify")
    @Operation(summary = "Verify fee payment request", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> verifyFeePayment(@PathVariable Long id,
                                                            @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(admissionService.verifyFeePayment(id, admin));
    }

    @PatchMapping("/admin/fee-verifications/{id}/reject")
    @Operation(summary = "Reject fee payment request", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> rejectFeePayment(@PathVariable Long id,
                                                            @RequestBody(required = false) Map<String, String> body,
                                                            @AuthenticationPrincipal User admin) {
        String reason = body != null ? body.getOrDefault("reason", "Payment verification rejected") : "Payment verification rejected";
        return ResponseEntity.ok(admissionService.rejectFeePayment(id, reason, admin));
    }

    // ── Admin: Fee Collection Analytics ──────────────────────────────────────
    @GetMapping("/admin/fee-collection")
    @Operation(summary = "Get fee collection summary and student fee list", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getFeeCollectionSummary() {
        return ResponseEntity.ok(admissionService.getFeeCollectionSummary());
    }

    // ── Student: Submit Fee Payment Request ──────────────────────────────────
    @PostMapping("/student/payment-requests")
    @Operation(summary = "Student submit fee payment receipt request", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<ApiResponse<?>> submitFeePaymentRequest(@Valid @RequestBody FeePaymentSubmissionRequest request,
                                                                  @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(admissionService.submitFeePaymentRequest(user.getId(), request));
    }

    // ── Student: Get Fee Overview & Receipts ──────────────────────────────────
    @GetMapping("/student/fee-details")
    @Operation(summary = "Get current student fee details and payment history", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<ApiResponse<?>> getStudentFeeDetails(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(admissionService.getStudentFeeDetails(user.getId()));
    }

    // ── Legacy / Application Endpoints ──────────────────────────────────────
    @PostMapping("/admissions")
    @Operation(summary = "Apply for admission", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<ApiResponse<?>> applyForAdmission(@Valid @RequestBody AdmissionRequest request,
                                                             @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(admissionService.applyForAdmission(request, user.getId()));
    }

    @GetMapping("/admissions/my")
    @Operation(summary = "Get my admission applications", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<ApiResponse<?>> getMyAdmissions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(admissionService.getUserAdmissions(user.getId()));
    }

    @GetMapping("/admissions/{id}")
    @Operation(summary = "Get admission by ID", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAdmissionById(@PathVariable Long id,
                                                             @AuthenticationPrincipal User user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(admissionService.getAdmissionById(id, user.getId(), isAdmin));
    }

    @GetMapping("/admin/admissions")
    @Operation(summary = "Get all admissions with filters (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAllAdmissions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String sessionYear,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(admissionService.getAllAdmissions(status, courseId, sessionYear, search, page, size, sortBy, sortDir));
    }

    @PatchMapping("/admin/admissions/{id}/approve")
    @Operation(summary = "Approve an admission (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> approveAdmission(@PathVariable Long id,
                                                            @RequestBody(required = false) Map<String, String> body,
                                                            @AuthenticationPrincipal User admin) {
        String remarks = body != null ? body.getOrDefault("remarks", "") : "";
        return ResponseEntity.ok(admissionService.approveAdmission(id, remarks, admin));
    }

    @PatchMapping("/admin/admissions/{id}/reject")
    @Operation(summary = "Reject an admission (Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> rejectAdmission(@PathVariable Long id,
                                                           @RequestBody Map<String, String> body,
                                                           @AuthenticationPrincipal User admin) {
        String reason = body.getOrDefault("reason", "Does not meet eligibility criteria");
        return ResponseEntity.ok(admissionService.rejectAdmission(id, reason, admin));
    }

    // ── Student Fee Portal & Itemized Payments ───────────────────────────────

    @GetMapping("/student/fee-dashboard")
    @Operation(summary = "Get logged-in student's semester-wise fee history & lock status", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<?>> getStudentFeeDashboard(@AuthenticationPrincipal User student) {
        return ResponseEntity.ok(ApiResponse.success(
                feeManagementService.getStudentFeeHistory(student),
                "Student semester fee history retrieved successfully"
        ));
    }

    @PostMapping("/student/pay-fee")
    @Operation(summary = "Pay selected fee types for a semester", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<?>> payStudentFee(
            @AuthenticationPrincipal User student,
            @Valid @RequestBody com.skm.request.PayFeeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                feeManagementService.payFeeTypes(student, request),
                "Fee payment completed successfully. Receipt generated!"
        ));
    }

    @GetMapping("/student/receipts/{receiptId}")
    @Operation(summary = "Get payment receipt by ID", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<ApiResponse<?>> getReceiptById(
            @PathVariable Long receiptId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(
                feeManagementService.getReceiptById(receiptId, currentUser),
                "Receipt details retrieved"
        ));
    }
}

