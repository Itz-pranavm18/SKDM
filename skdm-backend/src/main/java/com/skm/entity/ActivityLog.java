package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs",
    indexes = {
        @Index(name = "idx_log_user",   columnList = "user_id"),
        @Index(name = "idx_log_action", columnList = "action"),
        @Index(name = "idx_log_time",   columnList = "performed_at")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "username", length = 100)
    private String username;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id", length = 50)
    private String entityId;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "SUCCESS"; // SUCCESS, FAILURE

    @PrePersist
    public void prePersist() {
        if (performedAt == null) performedAt = LocalDateTime.now();
    }
}
