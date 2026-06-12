package com.kb.realestate.controller;

import com.kb.realestate.dto.ChecklistListDto;
import com.kb.realestate.service.ChecklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChecklistController {

    private final ChecklistService checklistService;

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