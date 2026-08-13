package com.skm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDto {
    private Long id;
    private String username;
    private String studentId;
    private String courseName;
    private String currentSemester;
    private Double totalFee;
    private Double paidFee;
    private Double remainingFee;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String profilePhotoUrl;
    private boolean active;
    private boolean emailVerified;
    private boolean suspended;
    private String suspensionReason;
    private LocalDateTime lastLoginAt;
    private Set<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
