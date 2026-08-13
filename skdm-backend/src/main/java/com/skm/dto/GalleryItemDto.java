package com.skm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GalleryItemDto {
    private Long id;
    private String caption;
    private String imageUrl;
    private String thumbnailUrl;
    private String tag;
    private String altText;
    private boolean active;
    private boolean featured;
    private int displayOrder;
    private LocalDateTime createdAt;
}
