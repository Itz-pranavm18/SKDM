package com.skm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FacultyDto {
    private Long id;
    private String name;
    private String designation;
    private String qualification;
    private String specialization;
    private Integer experienceYears;
    private String email;
    private String phone;
    private String photoUrl;
    private String initials;
    private String bio;
    private boolean active;
    private int displayOrder;
    private Long departmentId;
    private String departmentName;
    private LocalDateTime createdAt;
}
