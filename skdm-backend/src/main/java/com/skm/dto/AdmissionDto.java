package com.skm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdmissionDto {
    private Long id;
    private String applicationNumber;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private String sessionYear;
    private String status;
    private String remarks;
    private Double tenthPercentage;
    private Double twelfthPercentage;
    private Double graduationPercentage;
    private String category;
    private String subCategory;
    private java.util.List<String> documentUrls;
    private String photoUrl;
    private String reviewedBy;
    private LocalDate reviewedAt;
    private String rejectionReason;
    private boolean feePaid;
    private String feeReceiptNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
