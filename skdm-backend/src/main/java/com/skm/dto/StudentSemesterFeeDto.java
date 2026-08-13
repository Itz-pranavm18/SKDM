package com.skm.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentSemesterFeeDto {
    private Long id;
    private Long userId;
    private String courseCode;
    private String semester;
    private Double academicFee;
    private Double sportsFee;
    private Double examFee;
    private Double otherFee;
    private boolean academicPaid;
    private boolean sportsPaid;
    private boolean examPaid;
    private boolean otherPaid;
    private Double totalFee;
    private Double paidFee;
    private Double remainingFee;
    private String status; // PENDING, PARTIAL, PAID
    private boolean locked; // True if prior semester is pending
    private String lockedReason; // Message e.g. "Please clear all pending fees of Semester 1 before paying Semester 2 fees."
    private List<FeePaymentReceiptDto> receipts;
}
