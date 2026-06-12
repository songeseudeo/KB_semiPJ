package com.kb.realestate.service;

import com.kb.realestate.dto.LoanProfileDto;
import com.kb.realestate.dto.LoanRecommendationDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class LoanService {

    public List<LoanRecommendationDto> recommend(LoanProfileDto profile) {
        List<LoanRecommendationDto> results = new ArrayList<>();

        long dti = calcDti(profile);  // 부채상환비율
        long ltv = calcLtv(profile);  // 담보인정비율
        boolean isEmployed = !profile.getEmploymentType().equals("무직");
        boolean isRegular = profile.getEmploymentType().equals("정규직");
        int credit = profile.getCreditScore() != null ? profile.getCreditScore() : 0;

        // 디딤돌 대출 (매매, 무주택자, 연소득 6000만원 이하)
        if ("매매".equals(profile.getTradeType()) && profile.getAnnualIncome() <= 6000) {
            int score = 60;
            if (isRegular) score += 20;
            if (credit >= 700) score += 20;
            results.add(new LoanRecommendationDto(
                    "디딤돌 대출",
                    "구입자금 대출",
                    "연 2.15% ~ 3.00%",
                    26000L,
                    "무주택 세대주, 연소득 6000만원 이하",
                    "정부 지원 저금리 내 집 마련 대출. 최대 26,000만원까지 지원",
                    Math.min(score, 100)
            ));
        }

        // 버팀목 전세자금 대출 (전세, 연소득 5000만원 이하)
        if ("전세".equals(profile.getTradeType()) && profile.getAnnualIncome() <= 5000) {
            int score = 60;
            if (isEmployed) score += 20;
            if (credit >= 650) score += 20;
            results.add(new LoanRecommendationDto(
                    "버팀목 전세자금 대출",
                    "전세자금 대출",
                    "연 2.30% ~ 2.90%",
                    12000L,
                    "무주택 세대주, 연소득 5000만원 이하",
                    "정부 지원 저금리 전세자금 대출. 수도권 최대 12,000만원",
                    Math.min(score, 100)
            ));
        }

        // KB 주택담보대출 (매매/전세, 신용점수 700 이상)
        if (credit >= 700 && isEmployed && ltv <= 70) {
            int score = 50;
            if (isRegular) score += 20;
            if (credit >= 800) score += 15;
            if (dti <= 40) score += 15;
            results.add(new LoanRecommendationDto(
                    "KB 주택담보대출",
                    "주택담보 대출",
                    "연 3.50% ~ 5.00%",
                    profile.getTargetPrice() * 70 / 100,
                    "신용점수 700점 이상, 재직 중",
                    "KB국민은행 대표 주택담보대출. 최대 LTV 70%까지 지원",
                    Math.min(score, 100)
            ));
        }

        // KB 전세자금 대출 (전세, 신용점수 650 이상)
        if ("전세".equals(profile.getTradeType()) && credit >= 650 && isEmployed) {
            int score = 55;
            if (isRegular) score += 20;
            if (credit >= 750) score += 15;
            if (profile.getAnnualIncome() >= 3000) score += 10;
            results.add(new LoanRecommendationDto(
                    "KB 전세자금 대출",
                    "전세자금 대출",
                    "연 3.80% ~ 5.20%",
                    30000L,
                    "신용점수 650점 이상, 재직 중",
                    "KB국민은행 전세자금 대출. 최대 3억원까지 지원",
                    Math.min(score, 100)
            ));
        }

        // 중금리 신용대출 (신용점수 600~750)
        if (credit >= 600 && credit < 750 && isEmployed) {
            int score = 50;
            if (profile.getAnnualIncome() >= 3000) score += 20;
            if (credit >= 680) score += 20;
            results.add(new LoanRecommendationDto(
                    "KB 중금리 신용대출",
                    "신용대출",
                    "연 6.00% ~ 9.00%",
                    5000L,
                    "신용점수 600점 이상, 재직 중",
                    "중간 신용등급 고객을 위한 신용대출",
                    Math.min(score, 100)
            ));
        }

        // 추천 상품 없을 경우 기본 안내
        if (results.isEmpty()) {
            results.add(new LoanRecommendationDto(
                    "KB 금융상담 서비스",
                    "맞춤 상담",
                    "상담 후 결정",
                    0L,
                    "모든 고객",
                    "입력하신 정보로 자동 추천 가능한 상품이 없습니다. KB국민은행 상담을 통해 맞춤 상품을 안내받으세요.",
                    0
            ));
        }

        results.sort(Comparator.comparingInt(LoanRecommendationDto::getMatchScore).reversed());
        return results;
    }

    private long calcDti(LoanProfileDto profile) {
        if (profile.getAnnualIncome() == null || profile.getAnnualIncome() == 0) return 100;
        long debt = profile.getTotalDebt() != null ? profile.getTotalDebt() : 0;
        return debt * 100 / profile.getAnnualIncome();
    }

    private long calcLtv(LoanProfileDto profile) {
        if (profile.getTargetPrice() == null || profile.getTargetPrice() == 0) return 100;
        long assets = profile.getTotalAssets() != null ? profile.getTotalAssets() : 0;
        return (profile.getTargetPrice() - assets) * 100 / profile.getTargetPrice();
    }
}
