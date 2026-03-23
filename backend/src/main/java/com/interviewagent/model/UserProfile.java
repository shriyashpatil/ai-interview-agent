package com.interviewagent.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private Integer yearsOfExperience;

    @Column(nullable = false)
    private String domain; // e.g. "Backend", "Frontend", "Full Stack", "Data Science", "DevOps"

    @Column(length = 1000)
    private String currentSkills; // comma-separated or free text

    @Column(nullable = false, length = 500)
    private String goal; // e.g. "Crack product-based company (FAANG)"

    private String currentCTC; // e.g. "8 LPA"
    private String expectedCTC; // e.g. "20 LPA"

    @Column(nullable = false)
    private Integer timelineMonths; // realistic: min 3, typically 6-12

    private String whatsappNumber; // e.g. "+919876543210"

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
