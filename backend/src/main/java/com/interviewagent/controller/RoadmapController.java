package com.interviewagent.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewagent.dto.MilestoneUpdateRequest;
import com.interviewagent.model.*;
import com.interviewagent.repository.RoadmapMilestoneRepository;
import com.interviewagent.repository.RoadmapRepository;
import com.interviewagent.repository.UserProfileRepository;
import com.interviewagent.repository.UserRepository;
import com.interviewagent.service.RoadmapGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roadmap")
@RequiredArgsConstructor
@Slf4j
public class RoadmapController {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final RoadmapRepository roadmapRepository;
    private final RoadmapMilestoneRepository milestoneRepository;
    private final RoadmapGenerationService roadmapGenerationService;
    private final ObjectMapper objectMapper;

    /**
     * Generate a new roadmap based on the user's profile.
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateRoadmap(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(null);

        if (profile == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Please complete your profile before generating a roadmap."));
        }

        // Deactivate any existing active roadmaps
        roadmapRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), Roadmap.RoadmapStatus.ACTIVE)
                .ifPresent(r -> {
                    r.setStatus(Roadmap.RoadmapStatus.PAUSED);
                    roadmapRepository.save(r);
                });

        log.info("Generating roadmap for user {} with profile: domain={}, goal={}, timeline={}mo",
                user.getUsername(), profile.getDomain(), profile.getGoal(), profile.getTimelineMonths());

        Roadmap roadmap = roadmapGenerationService.generateRoadmap(user, profile);
        return ResponseEntity.ok(toRoadmapResponse(roadmap));
    }

    /**
     * Get the current active roadmap for the user.
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveRoadmap(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return roadmapRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(
                        user.getId(), Roadmap.RoadmapStatus.ACTIVE)
                .map(r -> ResponseEntity.ok(toRoadmapResponse(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all roadmaps for the user.
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllRoadmaps(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Roadmap> roadmaps = roadmapRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<Map<String, Object>> responses = roadmaps.stream()
                .map(this::toRoadmapResponse)
                .toList();

        return ResponseEntity.ok(responses);
    }

    /**
     * Update a milestone status (PENDING → IN_PROGRESS → COMPLETED).
     */
    @PatchMapping("/milestones/{milestoneId}")
    public ResponseEntity<?> updateMilestone(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long milestoneId,
            @RequestBody MilestoneUpdateRequest request) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        RoadmapMilestone milestone = milestoneRepository.findById(milestoneId)
                .orElse(null);

        if (milestone == null) {
            return ResponseEntity.notFound().build();
        }

        // Security check: milestone must belong to this user
        if (!milestone.getRoadmap().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }

        RoadmapMilestone.MilestoneStatus newStatus =
                RoadmapMilestone.MilestoneStatus.valueOf(request.getStatus().toUpperCase());
        milestone.setStatus(newStatus);

        if (newStatus == RoadmapMilestone.MilestoneStatus.COMPLETED) {
            milestone.setCompletedAt(LocalDate.now());

            // Check if all milestones are done → mark roadmap complete
            Roadmap roadmap = milestone.getRoadmap();
            boolean allDone = roadmap.getMilestones().stream()
                    .allMatch(m -> m.getId().equals(milestoneId)
                            || m.getStatus() == RoadmapMilestone.MilestoneStatus.COMPLETED);
            if (allDone) {
                roadmap.setStatus(Roadmap.RoadmapStatus.COMPLETED);
                roadmapRepository.save(roadmap);
            }
        }

        milestoneRepository.save(milestone);
        return ResponseEntity.ok(toMilestoneResponse(milestone));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Map<String, Object> toRoadmapResponse(Roadmap r) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", r.getId());
        map.put("title", r.getTitle());
        map.put("description", r.getDescription());
        map.put("totalWeeks", r.getTotalWeeks());
        map.put("startDate", r.getStartDate());
        map.put("targetDate", r.getTargetDate());
        map.put("status", r.getStatus());
        map.put("progressPercent", r.getProgressPercent());
        map.put("createdAt", r.getCreatedAt());

        List<Map<String, Object>> milestones = r.getMilestones() == null
                ? List.of()
                : r.getMilestones().stream().map(this::toMilestoneResponse).toList();
        map.put("milestones", milestones);

        return map;
    }

    private Map<String, Object> toMilestoneResponse(RoadmapMilestone m) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", m.getId());
        map.put("weekNumber", m.getWeekNumber());
        map.put("title", m.getTitle());
        map.put("description", m.getDescription());
        map.put("dueDate", m.getDueDate());
        map.put("status", m.getStatus());
        map.put("completedAt", m.getCompletedAt());

        // Parse tasks and resources from JSON strings
        map.put("tasks", parseJsonArray(m.getTasksJson()));
        map.put("resources", parseJsonArray(m.getResourcesJson()));

        return map;
    }

    private List<String> parseJsonArray(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            JsonNode node = objectMapper.readTree(json);
            List<String> list = new ArrayList<>();
            if (node.isArray()) {
                for (JsonNode item : node) list.add(item.asText());
            }
            return list;
        } catch (Exception e) {
            return List.of();
        }
    }
}
