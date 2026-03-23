package com.interviewagent.controller;

import com.interviewagent.dto.ChatRequest;
import com.interviewagent.dto.StartSessionRequest;
import com.interviewagent.model.InterviewSession;
import com.interviewagent.model.Message;
import com.interviewagent.model.User;
import com.interviewagent.repository.UserRepository;
import com.interviewagent.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;
    private final UserRepository userRepository;

    @PostMapping("/start")
    public ResponseEntity<?> startSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StartSessionRequest request) {
        User user = getUser(userDetails);
        InterviewSession session = interviewService.startSession(user, request);

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("status", session.getStatus());
        response.put("messages", interviewService.getSessionMessages(session.getId()));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{sessionId}/message")
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long sessionId,
            @Valid @RequestBody ChatRequest request) {
        User user = getUser(userDetails);
        Message aiResponse = interviewService.sendMessage(sessionId, user, request.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("message", aiResponse.getContent());
        response.put("role", aiResponse.getRole());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{sessionId}/end")
    public ResponseEntity<?> endSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long sessionId) {
        User user = getUser(userDetails);
        InterviewSession session = interviewService.endSession(sessionId, user);

        Map<String, Object> response = new HashMap<>();
        response.put("status", session.getStatus());
        response.put("score", session.getOverallScore());
        response.put("feedback", session.getAiFeedback());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<InterviewSession>> getUserSessions(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(interviewService.getUserSessions(user.getId()));
    }

    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long sessionId) {
        return ResponseEntity.ok(interviewService.getSessionMessages(sessionId));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
