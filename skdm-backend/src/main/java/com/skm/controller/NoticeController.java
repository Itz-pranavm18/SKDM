package com.skm.controller;

import com.skm.dto.NoticeDto;
import com.skm.response.ApiResponse;
import com.skm.service.impl.NoticeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Notices", description = "Notice board management APIs")
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping("/notices")
    @Operation(summary = "Get all active notices (public)")
    public ResponseEntity<ApiResponse<?>> getActiveNotices() {
        return ResponseEntity.ok(noticeService.getActiveNotices());
    }

    @GetMapping("/notices/{id}")
    public ResponseEntity<ApiResponse<?>> getNoticeById(@PathVariable Long id) {
        return ResponseEntity.ok(noticeService.getNoticeById(id));
    }

    @GetMapping("/admin/notices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAllNoticesAdmin(
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(noticeService.getAllNoticesAdmin(tag, search, active, page, size));
    }

    @PostMapping("/admin/notices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> createNotice(@RequestBody NoticeDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(noticeService.createNotice(dto));
    }

    @PutMapping("/admin/notices/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> updateNotice(@PathVariable Long id, @RequestBody NoticeDto dto) {
        return ResponseEntity.ok(noticeService.updateNotice(id, dto));
    }

    @DeleteMapping("/admin/notices/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> deleteNotice(@PathVariable Long id) {
        return ResponseEntity.ok(noticeService.deleteNotice(id));
    }
}
