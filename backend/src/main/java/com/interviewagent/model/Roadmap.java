package com.interviewagent.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "roadmaps")
@Data
@NoArgsConstructor
public class Roadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private Integer totalWeeks;

    private LocalDate startDate;
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    private RoadmapStatus status = RoadmapStatus.ACTIVE;

    @OneToMany(mappedBy = "roadmap", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("weekNumber ASC")
    private List<RoadmapMilestone> milestones = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum RoadmapStatus {
        ACTIVE, COMPLETED, PAUSED
    }

    // Calculate overall progress
    @Transient
    public int getProgressPercent() {
        if (milestones == null || milestones.isEmpty()) return 0;
        long completed = milestones.stream()
                .filter(m -> m.getStatus() == RoadmapMilestone.MilestoneStatus.COMPLETED)
                .count();
        return (int) ((completed * 100) / milestones.size());
    }
}
