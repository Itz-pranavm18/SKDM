package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fee_payment_requests",
    indexes = {
        @Index(name = "idx_fee_req_user", columnList = "user_id"),
        @Index(name = "idx_fee_req_status", columnList = "status"),
        @Index(name = "idx_fee_req_student_id", columnList = "student_id")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeePaymentRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_semester_fee_id")
    private StudentSemesterFee studentSemesterFee;

    @Column(name = "student_id", nullable = false, length = 50)
    private String studentId;

    @Column(name = "student_name", nullable = false, length = 120)
    private String studentName;

    @Column(name = "course_name", length = 100)
    private String courseName;

    @Column(name = "semester", length = 30)
    private String semester;

    @Column(name = "fee_types_paid", length = 255)
    private String feeTypesPaid;

    @Column(name = "pay_academic")
    @Builder.Default
    private Boolean payAcademic = false;

    @Column(name = "pay_sports")
    @Builder.Default
    private Boolean paySports = false;

    @Column(name = "pay_exam")
    @Builder.Default
    private Boolean payExam = false;

    @Column(name = "pay_other")
    @Builder.Default
    private Boolean payOther = false;

    public Boolean getPayAcademic() { return payAcademic != null && payAcademic; }
    public Boolean getPaySports() { return paySports != null && paySports; }
    public Boolean getPayExam() { return payExam != null && payExam; }
    public Boolean getPayOther() { return payOther != null && payOther; }

    public boolean isPayAcademic() { return getPayAcademic(); }
    public boolean isPaySports() { return getPaySports(); }
    public boolean isPayExam() { return getPayExam(); }
    public boolean isPayOther() { return getPayOther(); }

    @Column(name = "academic_amount")
    private Double academicAmount;

    @Column(name = "sports_amount")
    private Double sportsAmount;

    @Column(name = "exam_amount")
    private Double examAmount;

    @Column(name = "other_amount")
    private Double otherAmount;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "utr_number", nullable = false, length = 100)
    private String utrNumber;

    @Column(name = "transaction_number", nullable = false, length = 100)
    private String transactionNumber;

    @Column(name = "screenshot_url", length = 500)
    private String screenshotUrl;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(name = "receipt_number", length = 50)
    private String receiptNumber;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;
}
