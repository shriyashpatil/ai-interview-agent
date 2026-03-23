package com.interviewagent.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class WhatsAppService {

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.whatsapp-from:whatsapp:+14155238886}")
    private String fromNumber;

    private boolean enabled = false;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.isBlank()
                && authToken != null && !authToken.isBlank()) {
            Twilio.init(accountSid, authToken);
            enabled = true;
            log.info("WhatsApp (Twilio) service initialized successfully");
        } else {
            log.warn("Twilio credentials not configured — WhatsApp reminders disabled");
        }
    }

    public boolean sendMessage(String toNumber, String body) {
        if (!enabled) {
            log.info("[WhatsApp DISABLED] Would send to {}: {}", toNumber, body);
            return false;
        }
        try {
            // Ensure number has whatsapp: prefix
            String to = toNumber.startsWith("whatsapp:") ? toNumber : "whatsapp:" + toNumber;

            Message message = Message.creator(
                    new PhoneNumber(to),
                    new PhoneNumber(fromNumber),
                    body
            ).create();

            log.info("WhatsApp message sent to {} — SID: {}", toNumber, message.getSid());
            return true;
        } catch (Exception e) {
            log.error("Failed to send WhatsApp message to {}: {}", toNumber, e.getMessage());
            return false;
        }
    }

    public void sendRoadmapReminder(String toNumber, String userName, String milestoneTitle, String dueDate) {
        String body = String.format(
                "👋 Hi %s! Your AI Career Coach here.\n\n" +
                "⏰ *Upcoming milestone due %s:*\n_%s_\n\n" +
                "Stay consistent — every day of practice brings you closer to your goal! 💪\n\n" +
                "Login to track your progress: https://soothing-love-production-821f.up.railway.app",
                userName, dueDate, milestoneTitle
        );
        sendMessage(toNumber, body);
    }

    public void sendWeeklyCheckIn(String toNumber, String userName, int progressPercent, String nextMilestone) {
        String body = String.format(
                "📊 *Weekly Progress Update for %s*\n\n" +
                "Overall roadmap progress: *%d%%* completed 🎯\n\n" +
                "Next focus: _%s_\n\n" +
                "Keep going — you're building something great! 🚀",
                userName, progressPercent, nextMilestone
        );
        sendMessage(toNumber, body);
    }

    public boolean isEnabled() {
        return enabled;
    }
}
