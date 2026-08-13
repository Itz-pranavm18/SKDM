package com.skm.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewAdmissionRequest {

    @NotBlank(message = "Student name is required")
    private String name;

    @NotBlank(message = "Date of Birth is required")
    private String dob; // YYYY-MM-DD or DD/MM/YYYY

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;

    private String email; // Optional

    @NotBlank(message = "Course name is required")
    private String courseName;

    private String courseCode; // BA, BSC

    private String semester; // Semester 1 .. Semester 6

    private Double totalCourseFee; // Optional / calculated from fee structure
}
