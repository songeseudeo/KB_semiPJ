package com.kb.realestate.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoanProfileDto {
    private Long annualIncome;
    private Long totalAssets;
    private Long totalDebt;
    private Integer creditScore;
    private String employmentType;
    private String tradeType;
    private Long targetPrice;
}
