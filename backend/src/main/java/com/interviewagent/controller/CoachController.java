package com.interviewagent.controller;

import com.interviewagent.dto.ChatRequest;
import com.interviewagent.model.*;
import com.interviewagent.repository.RoadmapRepository;
import com.interviewagent.repository.UserProfileRepository;
import com.interviewagent.repository.UserRepository;
import com.interviewagent.service.ClaudeApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coach")
@RequiredArgsConstructor
@Slf4j
public class CoachController {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final RoadmapRepository roadmapRepository;
    private final ClaudeApiService claudeApiService;

    /**
     * Send a message to the AI career coach.
     * The coach knows about the user's profile and active roadmap.
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChatRequest request) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String systemPrompt = buildCoachSystemPrompt(user);

        // Use a stateless single-turn call with context injected via system prompt
        String response = claudeApiService.chat(systemPrompt, List.of(), request.getMessage());

        return ResponseEntity.ok(Map.of("reply", response));
    }

    private String buildCoachSystemPrompt(User user) {
        StringBuilder sb = new StringBuilder();

        sb.append("""
                You are a knowledgeable, encouraging, and practical AI career coach. \
                Your job is to help the user achieve their career goals. \
                Be specific, actionable, and motivating. \
                Keep responses concise but thorough — use bullet points when helpful. \
                You have access to the user's profile and roadmap below.\n\n
                """);

        // Inject user profile context
        profileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            sb.append("=== USER PROFILE ===\n");
            sb.append("Name: ").append(user.getUsername()).append("\n");
            sb.append("Domain: ").append(profile.getDomain()).append("\n");
            sb.append("Years of Experience: ").append(profile.getYearsOfExperience()).append(" years\n");
            if (profile.getCurrentSkills() != null) {
                sb.append("Current Skills: ").append(profile.getCurrentSkills()).append("\n");
            }
            sb.append("Goal: ").append(profile.getGoal()).append("\n");
            if (profile.getCurrentCTC() != null) {
                sb.append("Current CTC: ").append(profile.getCurrentCTC()).append("\n");
            }
            if (profile.getExpectedCTC() != null) {
                sb.append("Expected CTC: ").append(profile.getExpectedCTC()).append("\n");
            }
            sb.append("Timeline: ").append(profile.getTimelineMonths()).append(" months\n\n");
        });

        // Inject active roadmap context
        roadmapRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(
                user.getId(), Roadmap.RoadmapStatus.ACTIVE
        ).ifPresent(roadmap -> {
            sb.append("=== ACTIVE ROADMAP ===\n");
            sb.append("Title: ").append(roadmap.getTitle()).append("\n");
            sb.append("Overall Progress: ").append(roadmap.getProgressPercent()).append("% complete\n");
            sb.append("Target Date: ").append(roadmap.getTargetDate()).append("\n\n");
            sb.append("Milestones:\n");

            if (roadmap.getMilestones() != null) {
                for (RoadmapMilestone m : roadmap.getMilestones()) {
                    String statusEmoji = switch (m.getStatus()) {
                        case COMPLETED -> "✅";
                        case IN_PROGRESS -> "🔄";
                        case PENDING -> "⏳";
                    };
                    sb.append(String.format("  Week %d %s %s (due %s) — %s\n",
                            m.getWeekNumber(), statusEmoji, m.getTitle(),
                            m.getDueDate(), m.getStatus()));
                }
            }

            sb.append("\n");
        });

        sb.append("""
                === INSTRUCTIONS ===
                - Answer questions about the roadmap, career advice, or interview prep
                - When the user asks about a specific milestone, give detailed guidance
                - If asked about mock interviews, help them practice
                - If asked for resources, recommend specific, real courses/platforms/books
                - Stay focused on helping the user reach their stated goal
                """);

        return sb.toString();
    }
}
