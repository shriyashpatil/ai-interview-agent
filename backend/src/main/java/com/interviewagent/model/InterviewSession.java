package com.interviewagent.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interview_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewType interviewType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewCategory category;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SessionStatus status = SessionStatus.IN_PROGRESS;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @OrderBy("createdAt ASC")
    private List<Message> messages = new ArrayList<>();

    private Integer overallScore;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;

    public enum InterviewType {
        MOCK_INTERVIEW, QUESTION_PRACTICE
    }

    public enum InterviewCategory {
        SOFTWARE_ENGINEERING, DATA_SCIENCE, PRODUCT_BUSINESS, BEHAVIORAL, SYSTEM_DESIGN, GENERAL
    }

    public enum SessionStatus {
        IN_PROGRESS, COMPLETED, ABANDONED
    }
}
