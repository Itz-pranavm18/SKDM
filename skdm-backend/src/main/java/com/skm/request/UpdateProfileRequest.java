package com.skm.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 60, message = "First name must be 2-60 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 60, message = "Last name must be 2-60 characters")
    private String lastName;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Please provide a valid 10-digit Indian mobile number")
    private String phone;

    private LocalDate dateOfBirth;

    @Pattern(regexp = "^(MALE|FEMALE|OTHER)$", message = "Gender must be MALE, FEMALE or OTHER")
    private String gender;

    @Size(max = 500, message = "Address cannot exceed 500 characters")
    private String address;

    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String city;

    @Size(max = 100, message = "State cannot exceed 100 characters")
    private String state;

    @Pattern(regexp = "^\\d{6}$", message = "Please provide a valid 6-digit pincode")
    private String pincode;
}
