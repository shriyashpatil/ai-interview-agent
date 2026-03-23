package com.interviewagent.controller;

import com.interviewagent.dto.*;
import com.interviewagent.model.*;
import com.interviewagent.repository.*;
import com.interviewagent.service.LinkedInService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/linkedin")
@RequiredArgsConstructor
@Slf4j
public class LinkedInController {

    private final UserRepository userRepository;
    private final LinkedInProfileRepository profileRepository;
    private final OutreachMessageRepository messageRepository;
    private final JobApplicationRepository jobRepository;
    private final LinkedInService linkedInService;

    // ─── Profile Optimization ─────────────────────────────────────────────────

    /** Get stored profile optimization results */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return profileRepository.findByUserId(user.getId())
                .map(p -> ResponseEntity.ok(toProfileResponse(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    /** Analyze and optimize LinkedIn profile using Claude AI */
    @PostMapping("/profile/optimize")
    public ResponseEntity<?> optimizeProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileOptimizeRequest request) {

        User user = getUser(userDetails);
        if (request.getRawProfileText() == null || request.getRawProfileText().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Please paste your LinkedIn profile text."));
        }

        log.info("Optimizing LinkedIn profile for user {}", user.getUsername());
        LinkedInProfile profile = linkedInService.optimizeProfile(user, request);
        return ResponseEntity.ok(toProfileResponse(profile));
    }

    // ─── Cold Messages ────────────────────────────────────────────────────────

    /** List all outreach messages */
    @GetMapping("/messages")
    public ResponseEntity<List<Map<String, Object>>> getMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String status) {

        User user = getUser(userDetails);
        List<OutreachMessage> messages;

        if (status != null) {
            try {
                OutreachMessage.MessageStatus s = OutreachMessage.MessageStatus.valueOf(status.toUpperCase());
                messages = messageRepository.findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), s);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            messages = messageRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }

        return ResponseEntity.ok(messages.stream().map(this::toMessageResponse).toList());
    }

    /** Generate a personalised cold message using Claude AI */
    @PostMapping("/messages/generate")
    public ResponseEntity<?> generateMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody GenerateMessageRequest request) {

        User user = getUser(userDetails);
        if (request.getTargetName() == null || request.getTargetCompany() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Target name and company are required."));
        }

        log.info("Generating outreach message for user {} → {} at {}",
                user.getUsername(), request.getTargetName(), request.getTargetCompany());

        OutreachMessage message = linkedInService.generateMessage(user, request);
        return ResponseEntity.ok(toMessageResponse(message));
    }

    /** Update message status (e.g. mark as sent, got reply) */
    @PatchMapping("/messages/{id}")
    public ResponseEntity<?> updateMessageStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody UpdateMessageStatusRequest request) {

        User user = getUser(userDetails);
        OutreachMessage message = messageRepository.findById(id).orElse(null);

        if (message == null) return ResponseEntity.notFound().build();
        if (!message.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }

        if (request.getStatus() != null) {
            message.setStatus(OutreachMessage.MessageStatus.valueOf(request.getStatus().toUpperCase()));
        }
        if (request.getNotes() != null) message.setNotes(request.getNotes());
        if (request.getSentAt() != null) message.setSentAt(LocalDate.parse(request.getSentAt()));
        if (request.getRepliedAt() != null) message.setRepliedAt(LocalDate.parse(request.getRepliedAt()));

        // When marked as SENT, auto-schedule follow-up in 7 days
        if (OutreachMessage.MessageStatus.SENT.name().equals(request.getStatus())
                && message.getFollowUpScheduledAt() == null) {
            message.setFollowUpScheduledAt(LocalDate.now().plusDays(7));
        }

        messageRepository.save(message);
        return ResponseEntity.ok(toMessageResponse(message));
    }

    /** Generate an AI follow-up message for a previously sent message */
    @PostMapping("/messages/{id}/follow-up")
    public ResponseEntity<?> generateFollowUp(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = getUser(userDetails);
        OutreachMessage followUp = linkedInService.generateFollowUp(user, id);
        return ResponseEntity.ok(toMessageResponse(followUp));
    }

    /** Delete a message */
    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = getUser(userDetails);
        OutreachMessage message = messageRepository.findById(id).orElse(null);
        if (message == null) return ResponseEntity.notFound().build();
        if (!message.getUser().getId().equals(user.getId())) return ResponseEntity.status(403).build();

        messageRepository.delete(message);
        return ResponseEntity.noContent().build();
    }

    // ─── Job Applications ─────────────────────────────────────────────────────

    /** List all tracked job applications */
    @GetMapping("/jobs")
    public ResponseEntity<List<Map<String, Object>>> getJobs(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String status) {

        User user = getUser(userDetails);
        List<JobApplication> jobs;

        if (status != null) {
            try {
                JobApplication.ApplicationStatus s = JobApplication.ApplicationStatus.valueOf(status.toUpperCase());
                jobs = jobRepository.findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), s);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            jobs = jobRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }

        return ResponseEntity.ok(jobs.stream().map(this::toJobResponse).toList());
    }

    /** Add a job to track */
    @PostMapping("/jobs")
    public ResponseEntity<?> addJob(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody JobApplicationRequest request) {

        User user = getUser(userDetails);

        JobApplication job = new JobApplication();
        job.setUser(user);
        job.setJobTitle(request.getJobTitle());
        job.setCompany(request.getCompany());
        job.setJobUrl(request.getJobUrl());
        job.setLocation(request.getLocation());
        job.setSalary(request.getSalary());
        job.setJobDescription(request.getJobDescription());
        job.setNotes(request.getNotes());

        if (request.getSource() != null) {
            try {
                job.setSource(JobApplication.JobSource.valueOf(request.getSource().toUpperCase()));
            } catch (IllegalArgumentException e) {
                job.setSource(JobApplication.JobSource.OTHER);
            }
        }

        jobRepository.save(job);
        return ResponseEntity.ok(toJobResponse(job));
    }

    /** Update job application status/notes */
    @PatchMapping("/jobs/{id}")
    public ResponseEntity<?> updateJob(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody UpdateJobStatusRequest request) {

        User user = getUser(userDetails);
        JobApplication job = jobRepository.findById(id).orElse(null);

        if (job == null) return ResponseEntity.notFound().build();
        if (!job.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }

        if (request.getStatus() != null) {
            job.setStatus(JobApplication.ApplicationStatus.valueOf(request.getStatus().toUpperCase()));
        }
        if (request.getNotes() != null) job.setNotes(request.getNotes());
        if (request.getAppliedAt() != null) job.setAppliedAt(LocalDate.parse(request.getAppliedAt()));
        if (request.getFollowUpDate() != null) job.setFollowUpDate(LocalDate.parse(request.getFollowUpDate()));
        if (request.getInterviewDate() != null) job.setInterviewDate(LocalDate.parse(request.getInterviewDate()));

        jobRepository.save(job);
        return ResponseEntity.ok(toJobResponse(job));
    }

    /** Generate a cover letter + resume tips for a specific job using Claude AI */
    @PostMapping("/jobs/{id}/cover-letter")
    public ResponseEntity<?> generateCoverLetter(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = getUser(userDetails);
        log.info("Generating cover letter for job {} for user {}", id, user.getUsername());

        JobApplication job = linkedInService.generateCoverLetter(user, id);
        return ResponseEntity.ok(toJobResponse(job));
    }

    /** Delete a job */
    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        User user = getUser(userDetails);
        JobApplication job = jobRepository.findById(id).orElse(null);
        if (job == null) return ResponseEntity.notFound().build();
        if (!job.getUser().getId().equals(user.getId())) return ResponseEntity.status(403).build();

        jobRepository.delete(job);
        return ResponseEntity.noContent().build();
    }

    /** Get dashboard stats */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = getUser(userDetails);
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalMessages", messageRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).size());
        stats.put("sentMessages", messageRepository.findByUserIdAndStatusOrderByCreatedAtDesc(
                user.getId(), OutreachMessage.MessageStatus.SENT).size());
        stats.put("replies", messageRepository.findByUserIdAndStatusOrderByCreatedAtDesc(
                user.getId(), OutreachMessage.MessageStatus.REPLIED).size());
        stats.put("totalJobs", jobRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).size());
        stats.put("applied", jobRepository.countByUserIdAndStatus(user.getId(), JobApplication.ApplicationStatus.APPLIED));
        stats.put("interviews", jobRepository.countByUserIdAndStatus(user.getId(), JobApplication.ApplicationStatus.INTERVIEW));
        stats.put("offers", jobRepository.countByUserIdAndStatus(user.getId(), JobApplication.ApplicationStatus.OFFER));
        stats.put("hasProfile", profileRepository.existsByUserId(user.getId()));

        // Follow-ups due (messages sent 7+ days ago with no reply)
        List<OutreachMessage> overdue = messageRepository.findSentWithNoFollowUp(
                user.getId(), LocalDate.now().minusDays(7));
        stats.put("followUpsDue", overdue.size());

        return ResponseEntity.ok(stats);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private User getUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Map<String, Object> toProfileResponse(LinkedInProfile p) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("overallScore", p.getOverallScore());
        map.put("headlineSuggestion", p.getHeadlineSuggestion());
        map.put("summarySuggestion", p.getSummarySuggestion());
        map.put("skillsSuggestion", p.getSkillsSuggestion());
        map.put("experienceSuggestion", p.getExperienceSuggestion());
        map.put("keyImprovements", p.getKeyImprovements());
        map.put("lastAnalyzedAt", p.getLastAnalyzedAt());
        map.put("rawProfileText", p.getRawProfileText());
        return map;
    }

    private Map<String, Object> toMessageResponse(OutreachMessage m) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", m.getId());
        map.put("targetName", m.getTargetName());
        map.put("targetRole", m.getTargetRole());
        map.put("targetCompany", m.getTargetCompany());
        map.put("targetLinkedInUrl", m.getTargetLinkedInUrl());
        map.put("jobTitle", m.getJobTitle());
        map.put("messageText", m.getMessageText());
        map.put("status", m.getStatus());
        map.put("sentAt", m.getSentAt());
        map.put("repliedAt", m.getRepliedAt());
        map.put("followUpScheduledAt", m.getFollowUpScheduledAt());
        map.put("notes", m.getNotes());
        map.put("createdAt", m.getCreatedAt());
        map.put("additionalContext", m.getAdditionalContext());
        return map;
    }

    private Map<String, Object> toJobResponse(JobApplication j) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", j.getId());
        map.put("jobTitle", j.getJobTitle());
        map.put("company", j.getCompany());
        map.put("jobUrl", j.getJobUrl());
        map.put("source", j.getSource());
        map.put("location", j.getLocation());
        map.put("salary", j.getSalary());
        map.put("status", j.getStatus());
        map.put("appliedAt", j.getAppliedAt());
        map.put("followUpDate", j.getFollowUpDate());
        map.put("interviewDate", j.getInterviewDate());
        map.put("coverLetter", j.getCoverLetter());
        map.put("resumeTips", j.getResumeTips());
        map.put("notes", j.getNotes());
        map.put("createdAt", j.getCreatedAt());
        map.put("hasJobDescription", j.getJobDescription() != null && !j.getJobDescription().isBlank());
        return map;
    }
}
