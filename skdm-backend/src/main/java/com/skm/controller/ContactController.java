package com.skm.controller;

import com.skm.entity.ContactMessage;
import com.skm.mail.EmailService;
import com.skm.repository.ContactMessageRepository;
import com.skm.request.ContactRequest;
import com.skm.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Contact", description = "Public contact form submission API")
public class ContactController {

    private final ContactMessageRepository contactMessageRepository;
    private final EmailService emailService;

    @PostMapping
    @Operation(summary = "Submit a contact message (public)")
    public ResponseEntity<ApiResponse<?>> submitContact(@Valid @RequestBody ContactRequest request,
                                                         HttpServletRequest httpRequest) {
        ContactMessage message = ContactMessage.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .subject(request.getSubject())
                .message(request.getMessage())
                .status("UNREAD")
                .ipAddress(getClientIp(httpRequest))
                .build();

        contactMessageRepository.save(message);

        try {
            emailService.sendContactAcknowledgement(request.getEmail(), request.getFullName());
        } catch (Exception e) {
            log.warn("Failed to send contact acknowledgement email: {}", e.getMessage());
        }

        log.info("New contact message from: {} ({})", request.getFullName(), request.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thank you for your message. We will get back to you within 1-2 working days."));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) return request.getRemoteAddr();
        return xfHeader.split(",")[0];
    }
}
