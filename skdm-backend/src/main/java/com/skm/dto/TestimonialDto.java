package com.skm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TestimonialDto {
    private Long id;
    private String studentName;
    private String batchYear;
    private String quote;
    private String photoUrl;
    private String course;
    private Integer rating;
    private boolean active;
    private boolean featured;
    private int displayOrder;
    private LocalDateTime createdAt;
}
