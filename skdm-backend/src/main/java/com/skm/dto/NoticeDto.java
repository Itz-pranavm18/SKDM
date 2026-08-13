package com.skm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NoticeDto {
    private Long id;
    private String title;
    private String content;
    private LocalDate noticeDate;
    private String tag;
    private String attachmentUrl;
    private boolean pinned;
    private boolean active;
    private LocalDate expiresAt;
    private LocalDateTime createdAt;
}
