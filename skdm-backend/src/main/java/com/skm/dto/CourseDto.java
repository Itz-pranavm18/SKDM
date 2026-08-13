package com.skm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseDto {
    private Long id;
    private String code;
    private String name;
    private String shortName;
    private String description;
    private int durationYears;
    private int totalSeats;
    private String eligibility;
    private Double tuitionFee;
    private Double otherFee;
    private boolean active;
    private int displayOrder;
    private Long departmentId;
    private String departmentName;
    private java.util.List<String> subjects;
    private LocalDateTime createdAt;
}
