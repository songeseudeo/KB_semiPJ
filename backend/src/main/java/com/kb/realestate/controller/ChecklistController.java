package com.kb.realestate.controller;

import com.kb.realestate.dto.ChecklistListDto;
import com.kb.realestate.service.ChecklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChecklistController {

    private final ChecklistService checklistService;

    private static final Map<String, List<Map<String, String>>> ITEMS = new HashMap<>();
    static {
        ITEMS.put("전세", List.of(
            Map.of("id","1","title","등기부등본 확인","description","을구에 근저당권, 압류 등 권리관계를 확인하세요"),
            Map.of("id","2","title","전입신고 및 확정일자","description","계약 당일 주민센터에서 전입신고와 확정일자를 받으세요"),
            Map.of("id","3","title","전세보증보험 가입","description","HUG 또는 SGI 전세보증보험으로 보증금을 보호하세요"),
            Map.of("id","4","title","임대인 신분증 확인","description","등기부등본 소유자와 계약자가 동일인인지 확인하세요"),
            Map.of("id","5","title","건축물대장 확인","description","위반건축물 여부 및 용도를 확인하세요")
        ));
        ITEMS.put("월세", List.of(
            Map.of("id","6","title","등기부등본 확인","description","근저당권 설정 여부와 선순위 권리관계를 확인하세요"),
            Map.of("id","7","title","전입신고","description","계약 후 14일 이내 전입신고를 꼭 하세요"),
            Map.of("id","8","title","확정일자 신청","description","주민센터에서 확정일자를 받아 대항력을 갖추세요"),
            Map.of("id","9","title","특약사항 확인","description","수리 의무, 관리비 포함 여부 등 특약을 꼼꼼히 확인하세요"),
            Map.of("id","10","title","임대차계약서 작성","description","표준 임대차계약서를 사용하고 사본을 보관하세요")
        ));
        ITEMS.put("매매", List.of(
            Map.of("id","11","title","등기부등본 확인","description","소유권, 근저당권, 압류 등 모든 권리관계를 확인하세요"),
            Map.of("id","12","title","토지이용계획 확인","description","개발제한구역, 용도지역 등을 확인하세요"),
            Map.of("id","13","title","매도인 신분 확인","description","등기부등본 소유자와 매도인 일치 여부를 확인하세요"),
            Map.of("id","14","title","계약금 영수증 수령","description","계약금 지급 시 반드시 영수증을 받으세요"),
            Map.of("id","15","title","소유권이전등기 신청","description","잔금 지급 후 즉시 소유권이전등기를 신청하세요")
        ));
    }

    @GetMapping("/checklist")
    public ResponseEntity<List<Map<String, String>>> getChecklistItems(@RequestParam String tradeType) {
        return ResponseEntity.ok(ITEMS.getOrDefault(tradeType, List.of()));
    }

    @GetMapping("/lists")
    public ResponseEntity<List<ChecklistListDto>> getLists() {
        return ResponseEntity.ok(checklistService.getAllLists());
    }

    @PostMapping("/lists")
    public ResponseEntity<ChecklistListDto> createList(@RequestBody ChecklistListDto dto) {
        return ResponseEntity.ok(checklistService.createList(dto));
    }

    @GetMapping("/states/{id}")
    public ResponseEntity<Map<String, Boolean>> getStates(@PathVariable Long id) {
        return ResponseEntity.ok(checklistService.getStates(id));
    }

    @PutMapping("/states/{id}")
    public ResponseEntity<Void> updateStates(@PathVariable Long id,
                                             @RequestBody Map<String, Boolean> states) {
        checklistService.updateStates(id, states);
        return ResponseEntity.ok().build();
    }
}