package com.kb.realestate.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class LoanRecommendationDto {
    private String productName;     // 상품명
    private String loanType;        // 대출 종류
    private String interestRate;    // 금리
    private Long maxLoanAmount;     // 최대 대출 가능액 (만원)
    private String eligibility;     // 자격 조건
    private String description;     // 상품 설명
    private int matchScore;         // 적합도 점수 (0~100)
}
