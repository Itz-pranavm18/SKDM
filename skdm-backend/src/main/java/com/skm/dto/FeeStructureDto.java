package com.skm.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeeStructureDto {
    private Long id;
    private String courseCode;
    private String semester;
    private Double academicFee;
    private Double sportsFee;
    private Double examFee;
    private Double otherFee;
    private Double totalFee;
}
