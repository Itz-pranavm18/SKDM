package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "departments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Department extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", unique = true, nullable = false, length = 100)
    private String name;

    @Column(name = "code", unique = true, nullable = false, length = 20)
    private String code;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "head_of_dept", length = 100)
    private String headOfDept;

    @Column(name = "established_year")
    private Integer establishedYear;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "display_order")
    @Builder.Default
    private int displayOrder = 0;
}
