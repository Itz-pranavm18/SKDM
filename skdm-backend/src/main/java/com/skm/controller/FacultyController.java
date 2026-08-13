package com.skm.controller;

import com.skm.dto.FacultyDto;
import com.skm.response.ApiResponse;
import com.skm.service.impl.FacultyService;
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
@Tag(name = "Faculty", description = "Faculty management APIs")
public class FacultyController {

    private final FacultyService facultyService;

    @GetMapping("/faculty")
    @Operation(summary = "Get all active faculty (public)")
    public ResponseEntity<ApiResponse<?>> getAllActiveFaculty() {
        return ResponseEntity.ok(facultyService.getAllActiveFaculty());
    }

    @GetMapping("/faculty/{id}")
    @Operation(summary = "Get faculty by ID (public)")
    public ResponseEntity<ApiResponse<?>> getFacultyById(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.getFacultyById(id));
    }

    @GetMapping("/admin/faculty")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAllFacultyAdmin(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(facultyService.getAllFacultyAdmin(search, departmentId, active, page, size));
    }

    @PostMapping("/admin/faculty")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> createFaculty(@RequestBody FacultyDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facultyService.createFaculty(dto));
    }

    @PutMapping("/admin/faculty/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> updateFaculty(@PathVariable Long id, @RequestBody FacultyDto dto) {
        return ResponseEntity.ok(facultyService.updateFaculty(id, dto));
    }

    @DeleteMapping("/admin/faculty/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> deleteFaculty(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.deleteFaculty(id));
    }
}
