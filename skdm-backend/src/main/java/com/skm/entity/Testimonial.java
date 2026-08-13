package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "testimonials")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Testimonial extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_name", nullable = false, length = 100)
    private String studentName;

    @Column(name = "batch_year", length = 30)
    private String batchYear; // e.g. "B.A. 2022 Batch"

    @Column(name = "quote", nullable = false, length = 1000)
    private String quote;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "course", length = 100)
    private String course;

    @Column(name = "rating")
    private Integer rating; // 1–5

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private boolean featured = false;

    @Column(name = "display_order")
    @Builder.Default
    private int displayOrder = 0;
}
