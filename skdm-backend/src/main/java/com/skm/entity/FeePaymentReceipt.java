package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fee_payment_receipts",
    indexes = {
        @Index(name = "idx_fpr_user", columnList = "user_id"),
        @Index(name = "idx_fpr_receipt_num", columnList = "receipt_number")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeePaymentReceipt extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_number", unique = true, nullable = false, length = 50)
    private String receiptNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_semester_fee_id", nullable = false)
    private StudentSemesterFee studentSemesterFee;

    @Column(name = "course_code", nullable = false, length = 100)
    private String courseCode;

    @Column(name = "semester", nullable = false, length = 20)
    private String semester;

    @Column(name = "fee_types_paid", nullable = false, length = 255)
    private String feeTypesPaid; // e.g. "Academic Fee, Sports Fee"

    @Column(name = "total_paid", nullable = false)
    private Double totalPaid;

    @Column(name = "academic_amount")
    private Double academicAmount;

    @Column(name = "sports_amount")
    private Double sportsAmount;

    @Column(name = "exam_amount")
    private Double examAmount;

    @Column(name = "other_amount")
    private Double otherAmount;

    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;

    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private String paymentStatus = "PAID";
}
