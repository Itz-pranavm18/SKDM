package com.skm.controller;

import com.skm.dto.CourseDto;
import com.skm.response.ApiResponse;
import com.skm.service.impl.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Course management APIs")
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/courses")
    @Operation(summary = "Get all active courses (public)")
    public ResponseEntity<ApiResponse<?>> getAllActiveCourses() {
        return ResponseEntity.ok(courseService.getAllActiveCourses());
    }

    @GetMapping("/courses/{id}")
    @Operation(summary = "Get course by ID (public)")
    public ResponseEntity<ApiResponse<?>> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/admin/courses")
    @Operation(summary = "Get all courses with filtering (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAllCoursesAdmin(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "displayOrder") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(courseService.getAllCoursesAdmin(search, departmentId, active, page, size, sortBy, sortDir));
    }

    @PostMapping("/admin/courses")
    @Operation(summary = "Create a new course (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> createCourse(@Valid @RequestBody CourseDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourse(dto));
    }

    @PutMapping("/admin/courses/{id}")
    @Operation(summary = "Update a course (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseDto dto) {
        return ResponseEntity.ok(courseService.updateCourse(id, dto));
    }

    @DeleteMapping("/admin/courses/{id}")
    @Operation(summary = "Delete a course (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> deleteCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.deleteCourse(id));
    }
}
