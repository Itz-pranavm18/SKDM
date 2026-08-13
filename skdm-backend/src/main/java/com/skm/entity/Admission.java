package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "admissions",
    indexes = {
        @Index(name = "idx_admission_user",   columnList = "user_id"),
        @Index(name = "idx_admission_status", columnList = "status"),
        @Index(name = "idx_admission_course", columnList = "course_id")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Admission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_number", unique = true, nullable = false, length = 30)
    private String applicationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "session_year", nullable = false, length = 10)
    private String sessionYear; // e.g. "2026-27"

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, WAITLISTED

    @Column(name = "remarks", length = 1000)
    private String remarks;

    // Academic details
    @Column(name = "tenth_percentage")
    private Double tenthPercentage;

    @Column(name = "twelfth_percentage")
    private Double twelfthPercentage;

    @Column(name = "graduation_percentage")
    private Double graduationPercentage;

    @Column(name = "category", length = 20)
    private String category; // GEN, OBC, SC, ST, EWS

    @Column(name = "sub_category", length = 50)
    private String subCategory;

    // Documents
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "admission_documents", joinColumns = @JoinColumn(name = "admission_id"))
    @Column(name = "document_url", length = 500)
    @Builder.Default
    private List<String> documentUrls = new ArrayList<>();

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    // Review
    @Column(name = "reviewed_by", length = 100)
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDate reviewedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    // Fee
    @Column(name = "fee_paid")
    @Builder.Default
    private boolean feePaid = false;

    @Column(name = "fee_receipt_number", length = 50)
    private String feeReceiptNumber;
}
