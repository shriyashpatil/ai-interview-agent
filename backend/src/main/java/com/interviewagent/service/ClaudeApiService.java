package com.interviewagent.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.interviewagent.model.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@Slf4j
public class ClaudeApiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${claude.api.model}")
    private String model;

    public ClaudeApiService(
            @Value("${claude.api.key}") String apiKey,
            @Value("${claude.api.base-url}") String baseUrl) {
        this.objectMapper = new ObjectMapper();
        log.info("Initializing Claude API Service with model config, base URL: {}", baseUrl);
        log.info("API key present: {}, length: {}", apiKey != null && !apiKey.equals("your-api-key-here"), apiKey != null ? apiKey.length() : 0);
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("x-api-key", apiKey)
                .defaultHeader("anthropic-version", "2024-10-22")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    /**
     * Send a conversation to Claude and get a response.
     */
    public String chat(String systemPrompt, List<Message> conversationHistory, String userMessage) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);
            requestBody.put("max_tokens", 2048);
            requestBody.put("system", systemPrompt);

            ArrayNode messages = requestBody.putArray("messages");

            // Add conversation history
            for (Message msg : conversationHistory) {
                ObjectNode msgNode = messages.addObject();
                msgNode.put("role", msg.getRole() == Message.Role.USER ? "user" : "assistant");
                msgNode.put("content", msg.getContent());
            }

            // Add current user message
            ObjectNode userMsg = messages.addObject();
            userMsg.put("role", "user");
            userMsg.put("content", userMessage);

            log.info("Sending request to Claude API - model: {}, messages: {}", model, messages.size());

            String response = webClient.post()
                    .uri("/messages")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody.toString())
                    .exchangeToMono(clientResponse -> {
                        if (clientResponse.statusCode().isError()) {
                            return clientResponse.bodyToMono(String.class)
                                    .flatMap(errorBody -> {
                                        log.error("Claude API error - Status: {}, Body: {}", clientResponse.statusCode(), errorBody);
                                        return Mono.error(new RuntimeException("Claude API error " + clientResponse.statusCode() + ": " + errorBody));
                                    });
                        }
                        return clientResponse.bodyToMono(String.class);
                    })
                    .block();

            JsonNode responseJson = objectMapper.readTree(response);
            return responseJson.path("content").get(0).path("text").asText();

        } catch (Exception e) {
            log.error("Error calling Claude API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get response from Claude API: " + e.getMessage(), e);
        }
    }

    /**
     * Simple single-turn generation (used for roadmap generation, coach responses, etc.)
     */
    public String generateResponse(String prompt) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);
            requestBody.put("max_tokens", 4096);

            ArrayNode messages = requestBody.putArray("messages");
            ObjectNode userMsg = messages.addObject();
            userMsg.put("role", "user");
            userMsg.put("content", prompt);

            String response = webClient.post()
                    .uri("/messages")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody.toString())
                    .exchangeToMono(clientResponse -> {
                        if (clientResponse.statusCode().isError()) {
                            return clientResponse.bodyToMono(String.class)
                                    .flatMap(errorBody -> {
                                        log.error("Claude API error - Status: {}, Body: {}", clientResponse.statusCode(), errorBody);
                                        return Mono.error(new RuntimeException("Claude API error: " + errorBody));
                                    });
                        }
                        return clientResponse.bodyToMono(String.class);
                    })
                    .block();

            JsonNode responseJson = objectMapper.readTree(response);
            return responseJson.path("content").get(0).path("text").asText();

        } catch (Exception e) {
            log.error("Error calling Claude API generateResponse: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate response: " + e.getMessage(), e);
        }
    }

    /**
     * Analyze a resume using Claude.
     */
    public String analyzeResume(String resumeText) {
        String systemPrompt = """
                You are an expert career coach and resume reviewer. Analyze the provided resume and return a detailed JSON response with the following structure:
                {
                    "overallAssessment": "brief overall assessment",
                    "strengths": ["strength1", "strength2", ...],
                    "weaknesses": ["weakness1", "weakness2", ...],
                    "suggestedImprovements": ["improvement1", "improvement2", ...],
                    "likelyInterviewQuestions": ["question1", "question2", ...],
                    "roleRecommendation": "recommended roles based on the resume"
                }
                Return ONLY valid JSON, no additional text.
                """;

        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);
            requestBody.put("max_tokens", 2048);
            requestBody.put("system", systemPrompt);

            ArrayNode messages = requestBody.putArray("messages");
            ObjectNode userMsg = messages.addObject();
            userMsg.put("role", "user");
            userMsg.put("content", "Please analyze this resume:\n\n" + resumeText);

            String response = webClient.post()
                    .uri("/messages")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody.toString())
                    .exchangeToMono(clientResponse -> {
                        if (clientResponse.statusCode().isError()) {
                            return clientResponse.bodyToMono(String.class)
                                    .flatMap(errorBody -> {
                                        log.error("Claude API resume analysis error - Status: {}, Body: {}", clientResponse.statusCode(), errorBody);
                                        return Mono.error(new RuntimeException("Claude API error: " + errorBody));
                                    });
                        }
                        return clientResponse.bodyToMono(String.class);
                    })
                    .block();

            JsonNode responseJson = objectMapper.readTree(response);
            return responseJson.path("content").get(0).path("text").asText();

        } catch (Exception e) {
            log.error("Error analyzing resume with Claude API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to analyze resume", e);
        }
    }
}
