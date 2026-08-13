package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fee_structures",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_course_semester", columnNames = {"course_code", "semester"})
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeeStructure extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_code", nullable = false, length = 20)
    private String courseCode; // "BA", "BSC"

    @Column(name = "semester", nullable = false, length = 20)
    private String semester; // "Semester 1" .. "Semester 6"

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

    public Double getTotalFee() {
        double a = academicFee != null ? academicFee : 0.0;
        double s = sportsFee != null ? sportsFee : 0.0;
        double e = examFee != null ? examFee : 0.0;
        double o = otherFee != null ? otherFee : 0.0;
        return a + s + e + o;
    }
}
