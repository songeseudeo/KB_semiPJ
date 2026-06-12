package com.kb.realestate.service;

import com.kb.realestate.dto.ChatMessageDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    private static final String SYSTEM_PROMPT = """
            당신은 KB부동산 가이드의 AI 상담사입니다.
            한국 부동산 관련 질문(전세, 월세, 매매, 체크리스트, 대출 등)에 전문적으로 답변합니다.
            답변은 친절하고 명확하게 한국어로 제공하세요.
            부동산과 무관한 질문에는 부동산 관련 질문을 유도하세요.
            """;

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String chat(List<ChatMessageDto.Message> messages) {
        List<Map<String, Object>> groqMessages = new ArrayList<>();

        groqMessages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));

        for (ChatMessageDto.Message msg : messages) {
            groqMessages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "llama-3.1-8b-instant");
        requestBody.put("messages", groqMessages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);

        return extractReply(response.getBody());
    }

    @SuppressWarnings("unchecked")
    private String extractReply(Map<String, Object> response) {
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            return "죄송합니다. 응답을 처리하는 중 오류가 발생했습니다.";
        }
    }
}
