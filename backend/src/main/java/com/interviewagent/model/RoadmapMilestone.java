package com.interviewagent.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "roadmap_milestones")
@Data
@NoArgsConstructor
public class RoadmapMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    @Column(nullable = false)
    private Integer weekNumber;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    // Stored as JSON string for simplicity
    @Column(columnDefinition = "TEXT")
    private String tasksJson; // e.g. ["Complete DSA arrays module", "Solve 20 LeetCode easy"]

    @Column(columnDefinition = "TEXT")
    private String resourcesJson; // e.g. ["Striver's SDE Sheet", "NeetCode 150"]

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private MilestoneStatus status = MilestoneStatus.PENDING;

    private LocalDate completedAt;

    public enum MilestoneStatus {
        PENDING, IN_PROGRESS, COMPLETED
    }
}
