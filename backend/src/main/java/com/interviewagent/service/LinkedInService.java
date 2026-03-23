package com.interviewagent.service;

import com.interviewagent.dto.*;
import com.interviewagent.model.*;
import com.interviewagent.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class LinkedInService {

    private final LinkedInProfileRepository linkedInProfileRepository;
    private final OutreachMessageRepository outreachMessageRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserProfileRepository userProfileRepository;
    private final ClaudeApiService claudeApiService;

    // ─── Profile Optimization ─────────────────────────────────────────────────

    @Transactional
    public LinkedInProfile optimizeProfile(User user, ProfileOptimizeRequest request) {
        String prompt = buildProfileOptimizationPrompt(user, request);
        String response = claudeApiService.generateResponse(prompt);

        LinkedInProfile profile = linkedInProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    LinkedInProfile p = new LinkedInProfile();
                    p.setUser(user);
                    return p;
                });

        profile.setRawProfileText(request.getRawProfileText());
        profile.setLastAnalyzedAt(LocalDateTime.now());

        // Parse sections from Claude's structured response
        profile.setOverallScore(extractSection(response, "SCORE"));
        profile.setHeadlineSuggestion(extractSection(response, "HEADLINE"));
        profile.setSummarySuggestion(extractSection(response, "SUMMARY"));
        profile.setSkillsSuggestion(extractSection(response, "SKILLS"));
        profile.setExperienceSuggestion(extractSection(response, "EXPERIENCE"));
        profile.setKeyImprovements(extractSection(response, "TOP_ACTIONS"));

        return linkedInProfileRepository.save(profile);
    }

    private String buildProfileOptimizationPrompt(User user, ProfileOptimizeRequest request) {
        StringBuilder sb = new StringBuilder();

        // Inject user career context if available
        String careerContext = "";
        userProfileRepository.findByUserId(user.getId()).ifPresent(up ->
            careerContext.concat(String.format(
                "User's career goal: %s | Domain: %s | YoE: %d years | Target CTC: %s",
                up.getGoal(), up.getDomain(), up.getYearsOfExperience(),
                up.getExpectedCTC() != null ? up.getExpectedCTC() : "not specified"))
        );

        sb.append("""
                You are a world-class LinkedIn profile optimizer. Your job is to transform \
                a user's LinkedIn profile into one that gets recruiter attention and lands interviews.

                Analyze the profile below and provide highly specific, actionable improvements. \
                Be concrete — not generic. Give rewritten versions, not just suggestions.

                """);

        if (request.getTargetRole() != null) {
            sb.append("Target Role: ").append(request.getTargetRole()).append("\n");
        }
        if (request.getTargetCompany() != null) {
            sb.append("Target Company: ").append(request.getTargetCompany()).append("\n");
        }
        if (!careerContext.isEmpty()) {
            sb.append("Career Context: ").append(careerContext).append("\n");
        }

        sb.append("""

                === USER'S LINKEDIN PROFILE ===
                """).append(request.getRawProfileText()).append("""

                === END OF PROFILE ===

                Respond with EXACTLY these sections, each starting with the marker on its own line:

                [SCORE]
                Rate the profile X/10 and write 1-2 sentences on what's strong and what's missing.

                [HEADLINE]
                Write an optimised headline (max 220 chars). Include: role + value prop + keywords. \
                Give 2 alternative versions.

                [SUMMARY]
                Write a rewritten 3-paragraph About section. Para 1: who they are + unique value. \
                Para 2: key achievements with metrics. Para 3: what they're looking for + CTA.

                [SKILLS]
                List 15-20 must-have skills to add for their target role. Group by category. \
                Explain which are most important for ATS.

                [EXPERIENCE]
                For each role in their profile, suggest 2-3 bullet rewrites using the formula: \
                "Action verb + what you did + measurable impact". Focus on metrics.

                [TOP_ACTIONS]
                List exactly 5 high-priority actions they should take TODAY to improve their profile, \
                numbered 1-5. Be specific.
                """);

        return sb.toString();
    }

    // ─── Cold Message Generation ───────────────────────────────────────────────

    @Transactional
    public OutreachMessage generateMessage(User user, GenerateMessageRequest request) {
        String prompt = buildMessagePrompt(user, request);
        String messageText = claudeApiService.generateResponse(prompt);

        OutreachMessage message = new OutreachMessage();
        message.setUser(user);
        message.setTargetName(request.getTargetName());
        message.setTargetRole(request.getTargetRole());
        message.setTargetCompany(request.getTargetCompany());
        message.setTargetLinkedInUrl(request.getTargetLinkedInUrl());
        message.setJobTitle(request.getJobTitle());
        message.setAdditionalContext(request.getAdditionalContext());
        message.setMessageText(messageText.trim());
        message.setStatus(OutreachMessage.MessageStatus.DRAFT);

        return outreachMessageRepository.save(message);
    }

    private String buildMessagePrompt(User user, GenerateMessageRequest request) {
        StringBuilder sb = new StringBuilder();

        // Inject user context
        userProfileRepository.findByUserId(user.getId()).ifPresent(up -> {
            sb.append("=== MY PROFILE ===\n");
            sb.append("Name: ").append(user.getUsername()).append("\n");
            sb.append("Domain: ").append(up.getDomain()).append("\n");
            sb.append("YoE: ").append(up.getYearsOfExperience()).append(" years\n");
            sb.append("Current Skills: ").append(up.getCurrentSkills() != null ? up.getCurrentSkills() : "not specified").append("\n");
            sb.append("Goal: ").append(up.getGoal()).append("\n\n");
        });

        sb.append("=== TARGET PERSON ===\n");
        sb.append("Name: ").append(request.getTargetName()).append("\n");
        if (request.getTargetRole() != null) sb.append("Role: ").append(request.getTargetRole()).append("\n");
        sb.append("Company: ").append(request.getTargetCompany()).append("\n");
        if (request.getJobTitle() != null) sb.append("Role I'm targeting: ").append(request.getJobTitle()).append("\n");
        if (request.getAdditionalContext() != null) sb.append("Additional context: ").append(request.getAdditionalContext()).append("\n");

        sb.append("""

                === TASK ===
                Write a LinkedIn cold outreach message from me to the target person above.

                Rules:
                1. Keep it SHORT — max 300 characters for LinkedIn InMail connection request.
                2. Make it personal and specific — reference their company/role.
                3. Mention one genuine reason for reaching out (not just "I'm looking for a job").
                4. End with a soft CTA — ask for a quick 15-min chat or for any advice.
                5. Sound human, warm, and professional — NOT like a template.
                6. Do NOT include subject lines. Just the message body.
                7. After the main message, provide a shorter follow-up version (for if no reply after 7 days).

                Format your response as:

                [INITIAL MESSAGE]
                <the main outreach message>

                [FOLLOW-UP MESSAGE]
                <a shorter follow-up to send if no reply after 7 days>
                """);

        return sb.toString();
    }

    // ─── Cover Letter & Resume Tips ────────────────────────────────────────────

    @Transactional
    public JobApplication generateCoverLetter(User user, Long jobId) {
        JobApplication job = jobApplicationRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Forbidden");
        }

        String prompt = buildCoverLetterPrompt(user, job);
        String response = claudeApiService.generateResponse(prompt);

        // Extract cover letter and resume tips
        String coverLetter = extractSection(response, "COVER_LETTER");
        String resumeTips = extractSection(response, "RESUME_TIPS");

        job.setCoverLetter(coverLetter != null ? coverLetter : response);
        job.setResumeTips(resumeTips);

        return jobApplicationRepository.save(job);
    }

    private String buildCoverLetterPrompt(User user, JobApplication job) {
        StringBuilder sb = new StringBuilder();

        userProfileRepository.findByUserId(user.getId()).ifPresent(up -> {
            sb.append("=== CANDIDATE PROFILE ===\n");
            sb.append("Name: ").append(user.getUsername()).append("\n");
            sb.append("Domain: ").append(up.getDomain()).append("\n");
            sb.append("YoE: ").append(up.getYearsOfExperience()).append(" years\n");
            sb.append("Skills: ").append(up.getCurrentSkills() != null ? up.getCurrentSkills() : "not specified").append("\n");
            sb.append("Career Goal: ").append(up.getGoal()).append("\n");
            if (up.getCurrentCTC() != null) sb.append("Current CTC: ").append(up.getCurrentCTC()).append("\n");
            sb.append("\n");
        });

        sb.append("=== JOB DETAILS ===\n");
        sb.append("Job Title: ").append(job.getJobTitle()).append("\n");
        sb.append("Company: ").append(job.getCompany()).append("\n");
        if (job.getLocation() != null) sb.append("Location: ").append(job.getLocation()).append("\n");
        if (job.getJobDescription() != null) {
            sb.append("Job Description:\n").append(job.getJobDescription()).append("\n");
        }

        sb.append("""

                === TASK ===
                Generate two things:

                [COVER_LETTER]
                Write a compelling, personalised cover letter for this role. Rules:
                - Max 4 paragraphs, ~300-350 words
                - Para 1: Hook — mention specific thing about the company/role
                - Para 2: Relevant experience + key achievement with metrics
                - Para 3: Why this specific company (research, culture, product)
                - Para 4: CTA — express enthusiasm, mention availability
                - Use [Candidate Name] as placeholder
                - Do NOT be generic. Reference the job description specifics.

                [RESUME_TIPS]
                List 5 specific ways to tailor the resume for THIS role:
                - Which keywords to add from the job description
                - Which experience to highlight
                - What to move to the top
                - Any skills to add/emphasize
                Format as a numbered list.
                """);

        return sb.toString();
    }

    // ─── Follow-up Message Generation ─────────────────────────────────────────

    @Transactional
    public OutreachMessage generateFollowUp(User user, Long messageId) {
        OutreachMessage original = outreachMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!original.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Forbidden");
        }

        String prompt = String.format("""
                I sent a LinkedIn connection request to %s (%s at %s) %s ago but got no reply.

                Original message I sent:
                %s

                Write a brief, friendly follow-up message (max 200 characters).
                It should:
                1. Reference the original message briefly
                2. Add a new hook or value (new insight, article, question)
                3. Keep it short and not desperate
                4. End with a soft question

                Return ONLY the follow-up message text, nothing else.
                """,
                original.getTargetName(),
                original.getTargetRole() != null ? original.getTargetRole() : "professional",
                original.getTargetCompany(),
                original.getSentAt() != null ? daysSince(original.getSentAt()) + " days" : "a few days",
                original.getMessageText()
        );

        String followUp = claudeApiService.generateResponse(prompt).trim();

        // Create a new follow-up message record
        OutreachMessage followUpMsg = new OutreachMessage();
        followUpMsg.setUser(user);
        followUpMsg.setTargetName(original.getTargetName());
        followUpMsg.setTargetRole(original.getTargetRole());
        followUpMsg.setTargetCompany(original.getTargetCompany());
        followUpMsg.setTargetLinkedInUrl(original.getTargetLinkedInUrl());
        followUpMsg.setJobTitle(original.getJobTitle());
        followUpMsg.setMessageText(followUp);
        followUpMsg.setAdditionalContext("Follow-up to original message #" + original.getId());
        followUpMsg.setStatus(OutreachMessage.MessageStatus.DRAFT);

        // Mark original as having a follow-up scheduled
        original.setFollowUpScheduledAt(LocalDate.now());
        outreachMessageRepository.save(original);

        return outreachMessageRepository.save(followUpMsg);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String extractSection(String response, String marker) {
        if (response == null) return null;
        String startMarker = "[" + marker + "]";
        int start = response.indexOf(startMarker);
        if (start == -1) return null;
        start += startMarker.length();

        // Find next marker
        int end = response.length();
        int nextMarker = response.indexOf("\n[", start);
        if (nextMarker != -1) end = nextMarker;

        return response.substring(start, end).trim();
    }

    private long daysSince(LocalDate date) {
        return java.time.temporal.ChronoUnit.DAYS.between(date, LocalDate.now());
    }
}
