package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "notices",
    indexes = @Index(name = "idx_notice_date", columnList = "notice_date"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notice extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "content", length = 5000)
    private String content;

    @Column(name = "notice_date", nullable = false)
    private LocalDate noticeDate;

    @Column(name = "tag", length = 30)
    private String tag; // Admission, Exam, Scholarship, Event, Notice

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    @Column(name = "is_pinned", nullable = false)
    @Builder.Default
    private boolean pinned = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User author;
}
