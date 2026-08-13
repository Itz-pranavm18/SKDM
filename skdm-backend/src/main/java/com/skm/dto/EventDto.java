package com.skm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventDto {
    private Long id;
    private String title;
    private String description;
    private LocalDate eventDate;
    private String eventTime;
    private String venue;
    private String organizer;
    private String category;
    private String bannerUrl;
    private boolean active;
    private boolean featured;
    private LocalDateTime createdAt;
}
