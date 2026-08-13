package com.skm.service.impl;

import com.skm.constants.AppConstants;
import com.skm.dto.CourseDto;
import com.skm.entity.Course;
import com.skm.entity.Department;
import com.skm.exception.BadRequestException;
import com.skm.exception.DuplicateResourceException;
import com.skm.exception.ResourceNotFoundException;
import com.skm.repository.CourseRepository;
import com.skm.repository.DepartmentRepository;
import com.skm.response.ApiResponse;
import com.skm.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;

    @Cacheable(AppConstants.CACHE_COURSES)
    @Transactional(readOnly = true)
    public ApiResponse<List<CourseDto>> getAllActiveCourses() {
        List<CourseDto> courses = courseRepository.findByDeletedFalseAndActiveTrue()
                .stream().map(this::mapToDto).collect(Collectors.toList());
        return ApiResponse.success(courses, "Courses retrieved successfully");
    }

    @Transactional(readOnly = true)
    public ApiResponse<PagedResponse<CourseDto>> getAllCoursesAdmin(String search, Long departmentId,
                                                                     Boolean active, int page, int size,
                                                                     String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Course> coursePage = courseRepository.filterCourses(search, departmentId, active, pageable);
        return ApiResponse.success(PagedResponse.of(coursePage.map(this::mapToDto)), "Courses retrieved");
    }

    @Transactional(readOnly = true)
    public ApiResponse<CourseDto> getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        return ApiResponse.success(mapToDto(course), "Course retrieved successfully");
    }

    @CacheEvict(value = AppConstants.CACHE_COURSES, allEntries = true)
    public ApiResponse<CourseDto> createCourse(CourseDto dto) {
        if (courseRepository.existsByCode(dto.getCode())) {
            throw new DuplicateResourceException("Course with code '" + dto.getCode() + "' already exists");
        }

        Course course = new Course();
        mapFromDto(dto, course);
        courseRepository.save(course);
        log.info("Course created: {} ({})", course.getName(), course.getCode());
        return ApiResponse.created(mapToDto(course), "Course created successfully");
    }

    @CacheEvict(value = AppConstants.CACHE_COURSES, allEntries = true)
    public ApiResponse<CourseDto> updateCourse(Long id, CourseDto dto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));

        if (courseRepository.existsByCodeAndIdNot(dto.getCode(), id)) {
            throw new DuplicateResourceException("Course with code '" + dto.getCode() + "' already exists");
        }

        mapFromDto(dto, course);
        courseRepository.save(course);
        return ApiResponse.success(mapToDto(course), "Course updated successfully");
    }

    @CacheEvict(value = AppConstants.CACHE_COURSES, allEntries = true)
    public ApiResponse<Void> deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        course.softDelete();
        courseRepository.save(course);
        return ApiResponse.ok("Course deleted successfully");
    }

    private void mapFromDto(CourseDto dto, Course course) {
        course.setCode(dto.getCode());
        course.setName(dto.getName());
        course.setShortName(dto.getShortName());
        course.setDescription(dto.getDescription());
        course.setDurationYears(dto.getDurationYears());
        course.setTotalSeats(dto.getTotalSeats());
        course.setEligibility(dto.getEligibility());
        course.setTuitionFee(dto.getTuitionFee());
        course.setOtherFee(dto.getOtherFee());
        course.setActive(dto.isActive());
        course.setDisplayOrder(dto.getDisplayOrder());
        if (dto.getSubjects() != null) course.setSubjects(dto.getSubjects());
        if (dto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", dto.getDepartmentId()));
            course.setDepartment(dept);
        }
    }

    CourseDto mapToDto(Course c) {
        return CourseDto.builder()
                .id(c.getId())
                .code(c.getCode())
                .name(c.getName())
                .shortName(c.getShortName())
                .description(c.getDescription())
                .durationYears(c.getDurationYears())
                .totalSeats(c.getTotalSeats())
                .eligibility(c.getEligibility())
                .tuitionFee(c.getTuitionFee())
                .otherFee(c.getOtherFee())
                .active(c.isActive())
                .displayOrder(c.getDisplayOrder())
                .departmentId(c.getDepartment() != null ? c.getDepartment().getId() : null)
                .departmentName(c.getDepartment() != null ? c.getDepartment().getName() : null)
                .subjects(c.getSubjects() != null ? new java.util.ArrayList<>(c.getSubjects()) : new java.util.ArrayList<>())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
