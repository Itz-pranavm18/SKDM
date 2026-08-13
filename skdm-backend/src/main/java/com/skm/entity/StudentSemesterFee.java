package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_semester_fees",
    indexes = {
        @Index(name = "idx_ssf_user", columnList = "user_id"),
        @Index(name = "idx_ssf_sem", columnList = "semester")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_student_semester", columnNames = {"user_id", "semester"})
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentSemesterFee extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "course_code", nullable = false, length = 20)
    private String courseCode; // BA, BSC

    @Column(name = "semester", nullable = false, length = 20)
    private String semester; // Semester 1 .. Semester 6

    @Column(name = "academic_fee", nullable = false)
    @Builder.Default
    private Double academicFee = 0.0;

    @Column(name = "sports_fee", nullable = false)
    @Builder.Default
    private Double sportsFee = 0.0;

    @Column(name = "exam_fee", nullable = false)
    @Builder.Default
    private Double examFee = 0.0;

    @Column(name = "other_fee", nullable = false)
    @Builder.Default
    private Double otherFee = 0.0;

    @Column(name = "academic_paid", nullable = false)
    @Builder.Default
    private boolean academicPaid = false;

    @Column(name = "sports_paid", nullable = false)
    @Builder.Default
    private boolean sportsPaid = false;

    @Column(name = "exam_paid", nullable = false)
    @Builder.Default
    private boolean examPaid = false;

    @Column(name = "other_paid", nullable = false)
    @Builder.Default
    private boolean otherPaid = false;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, PARTIAL, PAID

    public Double getTotalFee() {
        double a = academicFee != null ? academicFee : 0.0;
        double s = sportsFee != null ? sportsFee : 0.0;
        double e = examFee != null ? examFee : 0.0;
        double o = otherFee != null ? otherFee : 0.0;
        return a + s + e + o;
    }

    public Double getPaidFee() {
        double paid = 0.0;
        if (academicPaid && academicFee != null) paid += academicFee;
        if (sportsPaid && sportsFee != null) paid += sportsFee;
        if (examPaid && examFee != null) paid += examFee;
        if (otherPaid && otherFee != null) paid += otherFee;
        return paid;
    }

    public Double getRemainingFee() {
        return Math.max(0.0, getTotalFee() - getPaidFee());
    }

    public void recalculateStatus() {
        double total = getTotalFee();
        double paid = getPaidFee();
        if (paid >= total && total > 0) {
            this.status = "PAID";
        } else if (paid > 0) {
            this.status = "PARTIAL";
        } else {
            this.status = "PENDING";
        }
    }
}
