package com.interviewagent.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
@Data
@NoArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Job details
    @Column(nullable = false)
    private String jobTitle;

    @Column(nullable = false)
    private String company;

    private String jobUrl;          // LinkedIn job URL or company career page URL

    @Enumerated(EnumType.STRING)
    private JobSource source = JobSource.LINKEDIN;

    private String location;
    private String salary;

    @Column(columnDefinition = "TEXT")
    private String jobDescription; // paste from the job listing

    // AI-generated content
    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    @Column(columnDefinition = "TEXT")
    private String resumeTips; // Claude's suggestions to tailor resume for this role

    // Tracking
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.WISHLIST;

    private LocalDate appliedAt;
    private LocalDate followUpDate;
    private LocalDate interviewDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum JobSource {
        LINKEDIN, COMPANY_SITE, REFERRAL, OTHER
    }

    public enum ApplicationStatus {
        WISHLIST,    // Saved to apply later
        APPLIED,     // Application submitted
        SCREENING,   // HR/recruiter screen
        INTERVIEW,   // In interview process
        OFFER,       // Received offer
        REJECTED,    // Rejected
        WITHDRAWN    // User withdrew
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
