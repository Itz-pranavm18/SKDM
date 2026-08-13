package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "uploaded_files")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UploadedFile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_name", nullable = false, length = 255)
    private String originalName;

    @Column(name = "stored_name", nullable = false, length = 255)
    private String storedName;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "file_type", length = 100)
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "purpose", length = 50)
    private String purpose; // PROFILE_PHOTO, ADMISSION_DOC, GALLERY, NOTICE, COURSE_MATERIAL

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_user_id")
    private User uploadedBy;
}
