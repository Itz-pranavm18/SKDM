package com.skm.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeePaymentReceiptDto {
    private Long id;
    private String receiptNumber;
    private Long userId;
    private String studentName;
    private String studentId;
    private String courseCode;
    private String semester;
    private String feeTypesPaid;
    private Double academicAmount;
    private Double sportsAmount;
    private Double examAmount;
    private Double otherAmount;
    private Double totalPaid;
    private LocalDateTime paymentDate;
    private String paymentStatus;
}
