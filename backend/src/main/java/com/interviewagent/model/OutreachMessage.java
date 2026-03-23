package com.interviewagent.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "outreach_messages")
@Data
@NoArgsConstructor
public class OutreachMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Target person details
    @Column(nullable = false)
    private String targetName;

    private String targetRole;      // e.g. "Engineering Manager"
    private String targetCompany;   // e.g. "Google"
    private String targetLinkedInUrl;

    // Context for message generation
    private String jobTitle;        // role user is targeting at this company
    @Column(columnDefinition = "TEXT")
    private String additionalContext; // any extra info user provides

    // Generated message
    @Column(columnDefinition = "TEXT")
    private String messageText;

    // Tracking
    @Enumerated(EnumType.STRING)
    private MessageStatus status = MessageStatus.DRAFT;

    private LocalDate sentAt;
    private LocalDate repliedAt;
    private LocalDate followUpScheduledAt;

    @Column(columnDefinition = "TEXT")
    private String notes; // user's private notes

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum MessageStatus {
        DRAFT,          // Generated, not yet sent
        SENT,           // User has sent it
        REPLIED,        // Got a reply
        NO_REPLY,       // No reply after follow-up window
        FOLLOW_UP_SENT  // Follow-up sent
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
