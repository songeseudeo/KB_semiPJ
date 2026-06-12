package com.kb.realestate.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "loan_profiles")
@Getter
@Setter
@NoArgsConstructor
public class LoanProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long annualIncome;      // 연소득 (만원)
    private Long totalAssets;       // 총 자산 (만원)
    private Long totalDebt;         // 총 부채 (만원)
    private Integer creditScore;    // 신용점수 (0~1000)
    private String employmentType;  // 직장유형 (정규직/계약직/자영업/무직)
    private String tradeType;       // 거래유형 (월세/전세/매매)
    private Long targetPrice;       // 목표 금액 (만원)
}
