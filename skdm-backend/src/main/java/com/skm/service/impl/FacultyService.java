package com.skm.service.impl;

import com.skm.constants.AppConstants;
import com.skm.dto.FacultyDto;
import com.skm.entity.Department;
import com.skm.entity.Faculty;
import com.skm.exception.ResourceNotFoundException;
import com.skm.repository.DepartmentRepository;
import com.skm.repository.FacultyRepository;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;

    @Cacheable(AppConstants.CACHE_FACULTY)
    @Transactional(readOnly = true)
    public ApiResponse<List<FacultyDto>> getAllActiveFaculty() {
        List<FacultyDto> faculty = facultyRepository.findByDeletedFalseAndActiveTrueOrderByDisplayOrder()
                .stream().map(this::mapToDto).collect(Collectors.toList());
        return ApiResponse.success(faculty, "Faculty retrieved successfully");
    }

    @Transactional(readOnly = true)
    public ApiResponse<PagedResponse<FacultyDto>> getAllFacultyAdmin(String search, Long departmentId,
                                                                      Boolean active, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("displayOrder").ascending());
        Page<Faculty> facultyPage = facultyRepository.filterFaculty(search, departmentId, active, pageable);
        return ApiResponse.success(PagedResponse.of(facultyPage.map(this::mapToDto)), "Faculty retrieved");
    }

    @Transactional(readOnly = true)
    public ApiResponse<FacultyDto> getFacultyById(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "id", id));
        return ApiResponse.success(mapToDto(faculty), "Faculty retrieved successfully");
    }

    @CacheEvict(value = AppConstants.CACHE_FACULTY, allEntries = true)
    public ApiResponse<FacultyDto> createFaculty(FacultyDto dto) {
        Faculty faculty = new Faculty();
        mapFromDto(dto, faculty);
        facultyRepository.save(faculty);
        return ApiResponse.created(mapToDto(faculty), "Faculty member added successfully");
    }

    @CacheEvict(value = AppConstants.CACHE_FACULTY, allEntries = true)
    public ApiResponse<FacultyDto> updateFaculty(Long id, FacultyDto dto) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "id", id));
        mapFromDto(dto, faculty);
        facultyRepository.save(faculty);
        return ApiResponse.success(mapToDto(faculty), "Faculty updated successfully");
    }

    @CacheEvict(value = AppConstants.CACHE_FACULTY, allEntries = true)
    public ApiResponse<Void> deleteFaculty(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "id", id));
        faculty.softDelete();
        facultyRepository.save(faculty);
        return ApiResponse.ok("Faculty member deleted successfully");
    }

    private void mapFromDto(FacultyDto dto, Faculty faculty) {
        faculty.setName(dto.getName());
        faculty.setDesignation(dto.getDesignation());
        faculty.setQualification(dto.getQualification());
        faculty.setSpecialization(dto.getSpecialization());
        faculty.setExperienceYears(dto.getExperienceYears());
        faculty.setEmail(dto.getEmail());
        faculty.setPhone(dto.getPhone());
        faculty.setPhotoUrl(dto.getPhotoUrl());
        faculty.setInitials(dto.getInitials());
        faculty.setBio(dto.getBio());
        faculty.setActive(dto.isActive());
        faculty.setDisplayOrder(dto.getDisplayOrder());
        if (dto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", dto.getDepartmentId()));
            faculty.setDepartment(dept);
        }
    }

    private FacultyDto mapToDto(Faculty f) {
        return FacultyDto.builder()
                .id(f.getId())
                .name(f.getName())
                .designation(f.getDesignation())
                .qualification(f.getQualification())
                .specialization(f.getSpecialization())
                .experienceYears(f.getExperienceYears())
                .email(f.getEmail())
                .phone(f.getPhone())
                .photoUrl(f.getPhotoUrl())
                .initials(f.getInitials())
                .bio(f.getBio())
                .active(f.isActive())
                .displayOrder(f.getDisplayOrder())
                .departmentId(f.getDepartment() != null ? f.getDepartment().getId() : null)
                .departmentName(f.getDepartment() != null ? f.getDepartment().getName() : null)
                .createdAt(f.getCreatedAt())
                .build();
    }
}
