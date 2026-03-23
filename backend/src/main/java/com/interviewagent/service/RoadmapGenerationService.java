package com.interviewagent.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewagent.model.*;
import com.interviewagent.repository.RoadmapRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoadmapGenerationService {

    private final ClaudeApiService claudeApiService;
    private final RoadmapRepository roadmapRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public Roadmap generateRoadmap(User user, UserProfile profile) {
        String prompt = buildPrompt(profile);
        String response = claudeApiService.generateResponse(prompt);

        Roadmap roadmap = parseRoadmapFromResponse(response, user, profile);
        return roadmapRepository.save(roadmap);
    }

    private String buildPrompt(UserProfile profile) {
        return String.format("""
            You are an expert career coach. Create a detailed, realistic career development roadmap for:

            - Years of Experience: %d years
            - Domain: %s
            - Current Skills: %s
            - Goal: %s
            - Current CTC: %s
            - Expected CTC: %s
            - Timeline: %d months

            Rules:
            1. Be specific and realistic — no vague tasks.
            2. Include practice with mock interviews and coding challenges in relevant weeks.
            3. Include resume improvement steps.
            4. Reference real learning resources (courses, platforms, books).
            5. Each milestone covers 1–2 weeks of focused work.
            6. The total number of milestones should match the timeline (%d months ≈ %d weeks).

            Respond ONLY with valid JSON in exactly this format (no markdown, no extra text):
            {
              "title": "short roadmap title",
              "description": "2-3 sentence overview of the plan",
              "totalWeeks": <number>,
              "milestones": [
                {
                  "weekNumber": 1,
                  "title": "milestone title",
                  "description": "what to achieve this week",
                  "tasks": ["task 1", "task 2", "task 3"],
                  "resources": ["Resource name — link or platform"]
                }
              ]
            }
            """,
                profile.getYearsOfExperience(),
                profile.getDomain(),
                profile.getCurrentSkills() != null ? profile.getCurrentSkills() : "Not specified",
                profile.getGoal(),
                profile.getCurrentCTC() != null ? profile.getCurrentCTC() : "Not specified",
                profile.getExpectedCTC() != null ? profile.getExpectedCTC() : "Not specified",
                profile.getTimelineMonths(),
                profile.getTimelineMonths(),
                profile.getTimelineMonths() * 4
        );
    }

    private Roadmap parseRoadmapFromResponse(String response, User user, UserProfile profile) {
        Roadmap roadmap = new Roadmap();
        roadmap.setUser(user);
        roadmap.setStartDate(LocalDate.now());
        roadmap.setTargetDate(LocalDate.now().plusMonths(profile.getTimelineMonths()));

        try {
            // Strip any markdown code fences if Claude adds them
            String json = response.trim();
            if (json.startsWith("```")) {
                json = json.replaceAll("^```[a-z]*\\n?", "").replaceAll("```$", "").trim();
            }

            JsonNode root = objectMapper.readTree(json);
            roadmap.setTitle(root.path("title").asText("My Career Roadmap"));
            roadmap.setDescription(root.path("description").asText(""));
            roadmap.setTotalWeeks(root.path("totalWeeks").asInt(profile.getTimelineMonths() * 4));

            List<RoadmapMilestone> milestones = new ArrayList<>();
            JsonNode milestonesNode = root.path("milestones");
            LocalDate currentDate = LocalDate.now();

            for (JsonNode m : milestonesNode) {
                RoadmapMilestone milestone = new RoadmapMilestone();
                milestone.setRoadmap(roadmap);
                milestone.setWeekNumber(m.path("weekNumber").asInt());
                milestone.setTitle(m.path("title").asText());
                milestone.setDescription(m.path("description").asText());
                milestone.setTasksJson(m.path("tasks").toString());
                milestone.setResourcesJson(m.path("resources").toString());
                milestone.setDueDate(currentDate.plusWeeks(m.path("weekNumber").asInt()));
                milestone.setStatus(RoadmapMilestone.MilestoneStatus.PENDING);
                milestones.add(milestone);
            }

            roadmap.setMilestones(milestones);
        } catch (Exception e) {
            log.error("Failed to parse roadmap JSON, creating fallback", e);
            roadmap.setTitle(profile.getGoal());
            roadmap.setDescription("AI-generated roadmap for " + profile.getDomain() + " — " + profile.getGoal());
            roadmap.setTotalWeeks(profile.getTimelineMonths() * 4);
            roadmap.setMilestones(buildFallbackMilestones(roadmap, profile));
        }

        return roadmap;
    }

    private List<RoadmapMilestone> buildFallbackMilestones(Roadmap roadmap, UserProfile profile) {
        List<RoadmapMilestone> milestones = new ArrayList<>();
        String[] defaultTitles = {
                "Foundation & Assessment", "Core Skills Building", "Advanced Topics",
                "Project Work", "Interview Preparation", "Mock Interviews & Refinement"
        };
        int weeks = Math.min(profile.getTimelineMonths() * 4, 24);
        int step = Math.max(1, weeks / defaultTitles.length);

        for (int i = 0; i < defaultTitles.length && (i * step) < weeks; i++) {
            RoadmapMilestone m = new RoadmapMilestone();
            m.setRoadmap(roadmap);
            m.setWeekNumber((i * step) + 1);
            m.setTitle(defaultTitles[i]);
            m.setDescription("Focus on " + defaultTitles[i].toLowerCase() + " for " + profile.getDomain());
            m.setTasksJson("[\"Complete assigned learning modules\",\"Practice problems\",\"Document progress\"]");
            m.setResourcesJson("[\"Domain-specific courses\",\"LeetCode / HackerRank\"]");
            m.setDueDate(LocalDate.now().plusWeeks((i * step) + step));
            m.setStatus(RoadmapMilestone.MilestoneStatus.PENDING);
            milestones.add(m);
        }
        return milestones;
    }
}
