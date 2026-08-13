package com.skm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeePaymentDto {

    private Long id;
    private Long userId;
    private String studentId;
    private String studentName;
    private String courseName;
    private String semester;
    private String feeTypesPaid;
    private boolean payAcademic;
    private boolean paySports;
    private boolean payExam;
    private boolean payOther;
    private Double academicAmount;
    private Double sportsAmount;
    private Double examAmount;
    private Double otherAmount;
    private Double amount;
    private LocalDate paymentDate;
    private String utrNumber;
    private String transactionNumber;
    private String screenshotUrl;
    private String remarks;
    private String status; // PENDING, VERIFIED, REJECTED
    private String receiptNumber;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime verifiedAt;
    private String verifiedBy;
}
