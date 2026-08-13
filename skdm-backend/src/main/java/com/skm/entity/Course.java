package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Course extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", unique = true, nullable = false, length = 20)
    private String code;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "short_name", length = 20)
    private String shortName;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "duration_years", nullable = false)
    private int durationYears;

    @Column(name = "total_seats", nullable = false)
    private int totalSeats;

    @Column(name = "eligibility", length = 500)
    private String eligibility;

    @Column(name = "tuition_fee")
    private Double tuitionFee;

    @Column(name = "other_fee")
    private Double otherFee;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "display_order")
    @Builder.Default
    private int displayOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ElementCollection
    @CollectionTable(name = "course_subjects", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "subject")
    @Builder.Default
    private List<String> subjects = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Admission> admissions = new ArrayList<>();
}
