package com.interviewagent.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "linkedin_profiles")
@Data
@NoArgsConstructor
public class LinkedInProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String rawProfileText; // User pastes their current LinkedIn profile

    @Column(columnDefinition = "TEXT")
    private String headlineSuggestion;

    @Column(columnDefinition = "TEXT")
    private String summarySuggestion;

    @Column(columnDefinition = "TEXT")
    private String skillsSuggestion;

    @Column(columnDefinition = "TEXT")
    private String experienceSuggestion;

    @Column(columnDefinition = "TEXT")
    private String overallScore; // e.g. "7/10 — Strong but missing keywords"

    @Column(columnDefinition = "TEXT")
    private String keyImprovements; // JSON array of top 5 action items

    private LocalDateTime lastAnalyzedAt;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
