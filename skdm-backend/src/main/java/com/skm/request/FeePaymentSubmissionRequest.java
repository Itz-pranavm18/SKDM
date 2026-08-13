package com.skm.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeePaymentSubmissionRequest {

    private Long semesterFeeId;

    private String semester;

    private boolean payAcademic;
    private boolean paySports;
    private boolean payExam;
    private boolean payOther;

    private Double amount;

    @NotBlank(message = "Payment date is required")
    private String paymentDate;

    @NotBlank(message = "UTR Number is required")
    private String utrNumber;

    @NotBlank(message = "Transaction Number is required")
    private String transactionNumber;

    private String screenshotUrl;
    private String remarks;
}
