package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "gallery_items",
    indexes = @Index(name = "idx_gallery_tag", columnList = "tag"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GalleryItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "caption", nullable = false, length = 200)
    private String caption;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "tag", length = 50)
    private String tag; // Campus, Events, Sports, Academics, Community

    @Column(name = "alt_text", length = 200)
    private String altText;

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
