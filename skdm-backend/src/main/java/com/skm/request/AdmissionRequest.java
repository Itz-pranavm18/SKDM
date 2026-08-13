package com.skm.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class AdmissionRequest {

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotBlank(message = "Session year is required")
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Session year format must be YYYY-YY (e.g. 2026-27)")
    private String sessionYear;

    @Min(value = 0, message = "10th percentage cannot be negative")
    @Max(value = 100, message = "10th percentage cannot exceed 100")
    private Double tenthPercentage;

    @Min(value = 0, message = "12th percentage cannot be negative")
    @Max(value = 100, message = "12th percentage cannot exceed 100")
    private Double twelfthPercentage;

    @Min(value = 0, message = "Graduation percentage cannot be negative")
    @Max(value = 100, message = "Graduation percentage cannot exceed 100")
    private Double graduationPercentage;

    @NotBlank(message = "Category is required")
    @Pattern(regexp = "^(GEN|OBC|SC|ST|EWS)$", message = "Category must be one of: GEN, OBC, SC, ST, EWS")
    private String category;

    private String subCategory;
    private List<String> documentUrls;
    private String photoUrl;
}
