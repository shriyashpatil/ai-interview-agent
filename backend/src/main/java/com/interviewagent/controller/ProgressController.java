package com.interviewagent.controller;

import com.interviewagent.model.InterviewSession;
import com.interviewagent.model.User;
import com.interviewagent.repository.UserRepository;
import com.interviewagent.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getProgress(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(progressService.getUserProgress(user.getId()));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(progressService.getUserStats(user.getId()));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getByCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable InterviewSession.InterviewCategory category) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(progressService.getUserProgressByCategory(user.getId(), category));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
