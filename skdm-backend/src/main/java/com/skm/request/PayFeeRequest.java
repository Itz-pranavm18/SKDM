package com.skm.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PayFeeRequest {

    @NotNull(message = "Semester fee ID is required")
    private Long semesterFeeId;

    private boolean payAcademic;
    private boolean paySports;
    private boolean payExam;
    private boolean payOther;
}
