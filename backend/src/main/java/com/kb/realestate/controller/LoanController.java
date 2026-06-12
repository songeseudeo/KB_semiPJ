package com.kb.realestate.controller;

import com.kb.realestate.dto.LoanProfileDto;
import com.kb.realestate.dto.LoanRecommendationDto;
import com.kb.realestate.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loan")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PostMapping("/recommend")
    public ResponseEntity<List<LoanRecommendationDto>> recommend(@RequestBody LoanProfileDto profile) {
        List<LoanRecommendationDto> recommendations = loanService.recommend(profile);
        return ResponseEntity.ok(recommendations);
    }
}
