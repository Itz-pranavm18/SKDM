package com.skm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentFeeOverviewDto {

    private Long userId;
    private String studentId;
    private String name;
    private String dob;
    private String address;
    private String mobileNumber;
    private String email;
    private String courseName;
    private Double totalFee;
    private Double paidFee;
    private Double remainingFee;
    private List<FeePaymentDto> paymentRequests;
}
