package com.interviewagent.service;

import com.interviewagent.model.RoadmapMilestone;
import com.interviewagent.model.UserProfile;
import com.interviewagent.repository.RoadmapMilestoneRepository;
import com.interviewagent.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoadmapSchedulerService {

    private final RoadmapMilestoneRepository milestoneRepository;
    private final UserProfileRepository userProfileRepository;
    private final WhatsAppService whatsAppService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    /**
     * Every day at 9:00 AM — send reminders for milestones due in the next 2 days.
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void sendMilestoneReminders() {
        if (!whatsAppService.isEnabled()) {
            log.debug("WhatsApp disabled, skipping milestone reminders");
            return;
        }

        LocalDate today = LocalDate.now();
        LocalDate in2Days = today.plusDays(2);

        List<RoadmapMilestone> upcoming = milestoneRepository.findUpcomingMilestones(today, in2Days);
        log.info("Sending milestone reminders for {} upcoming milestones", upcoming.size());

        for (RoadmapMilestone milestone : upcoming) {
            try {
                Long userId = milestone.getRoadmap().getUser().getId();
                Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(userId);

                if (profileOpt.isPresent() && profileOpt.get().getWhatsappNumber() != null) {
                    UserProfile profile = profileOpt.get();
                    String userName = milestone.getRoadmap().getUser().getUsername();
                    String dueDate = milestone.getDueDate().format(DATE_FMT);

                    whatsAppService.sendRoadmapReminder(
                            profile.getWhatsappNumber(),
                            userName,
                            milestone.getTitle(),
                            dueDate
                    );
                }
            } catch (Exception e) {
                log.error("Error sending reminder for milestone {}: {}", milestone.getId(), e.getMessage());
            }
        }
    }

    /**
     * Every Monday at 8:00 AM — send weekly progress check-in.
     */
    @Scheduled(cron = "0 0 8 * * MON")
    public void sendWeeklyCheckIns() {
        if (!whatsAppService.isEnabled()) return;

        List<UserProfile> profiles = userProfileRepository.findAll();
        for (UserProfile profile : profiles) {
            try {
                if (profile.getWhatsappNumber() == null) continue;

                // Get active roadmap progress
                // We get it via the user's active roadmap
                var roadmaps = profile.getUser().getId();
                // Simple weekly nudge — detailed progress is handled by the roadmap service
                whatsAppService.sendMessage(
                        profile.getWhatsappNumber(),
                        String.format(
                                "🌅 Good Monday, %s!\n\n" +
                                "It's a new week — time to make progress on your goal: *%s*\n\n" +
                                "Log in and check your roadmap milestones for this week! 📋\n" +
                                "https://soothing-love-production-821f.up.railway.app",
                                profile.getUser().getUsername(),
                                profile.getGoal()
                        )
                );
            } catch (Exception e) {
                log.error("Error sending weekly check-in for user {}: {}", profile.getId(), e.getMessage());
            }
        }
    }
}
