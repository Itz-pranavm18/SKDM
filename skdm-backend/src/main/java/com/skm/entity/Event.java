package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "events",
    indexes = @Index(name = "idx_event_date", columnList = "event_date"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Event extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", length = 3000)
    private String description;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "event_time", length = 20)
    private String eventTime;

    @Column(name = "venue", length = 200)
    private String venue;

    @Column(name = "organizer", length = 100)
    private String organizer;

    @Column(name = "category", length = 50)
    private String category; // Cultural, Sports, Academic, National

    @Column(name = "banner_url", length = 500)
    private String bannerUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private boolean featured = false;
}
