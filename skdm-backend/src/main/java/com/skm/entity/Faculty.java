package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "faculty",
    indexes = @Index(name = "idx_faculty_dept", columnList = "department_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Faculty extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "designation", nullable = false, length = 100)
    private String designation;

    @Column(name = "qualification", length = 200)
    private String qualification;

    @Column(name = "specialization", length = 200)
    private String specialization;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "phone", length = 15)
    private String phone;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "initials", length = 5)
    private String initials;

    @Column(name = "bio", length = 2000)
    private String bio;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "display_order")
    @Builder.Default
    private int displayOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;
}
