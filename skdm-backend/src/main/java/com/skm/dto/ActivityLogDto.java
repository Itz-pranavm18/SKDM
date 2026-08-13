package com.skm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ActivityLogDto {
    private Long id;
    private Long userId;
    private String username;
    private String action;
    private String description;
    private String entityType;
    private String entityId;
    private String ipAddress;
    private LocalDateTime performedAt;
    private String status;
}
