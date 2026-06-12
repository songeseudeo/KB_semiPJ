package com.kb.realestate.controller;

import com.kb.realestate.dto.ChatMessageDto;
import com.kb.realestate.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @Value("${groq.api.key}")
    private String apiKey;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        boolean configured = apiKey != null && !apiKey.equals("your-api-key-here");
        return ResponseEntity.ok(Map.of("configured", configured));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> chat(@RequestBody ChatMessageDto request) {
        if (apiKey == null || apiKey.equals("your-api-key-here")) {
            return ResponseEntity.ok(Map.of(
                    "reply", "⚠️ API 키가 설정되지 않았습니다. application.yml에 GEMINI_API_KEY를 설정하세요.",
                    "error", "API_KEY_MISSING"
            ));
        }

        try {
            String reply = chatService.chat(request.getMessages());
            return ResponseEntity.ok(Map.of("reply", reply));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "reply", "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                    "error", e.getMessage()
            ));
        }
    }
}
