package com.interviewagent.repository;

import com.interviewagent.model.RoadmapMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface RoadmapMilestoneRepository extends JpaRepository<RoadmapMilestone, Long> {
    List<RoadmapMilestone> findByRoadmapId(Long roadmapId);

    @Query("""
        SELECT m FROM RoadmapMilestone m
        JOIN m.roadmap r
        JOIN r.user u
        WHERE m.dueDate BETWEEN :from AND :to
        AND m.status <> 'COMPLETED'
        AND r.status = 'ACTIVE'
        """)
    List<RoadmapMilestone> findUpcomingMilestones(LocalDate from, LocalDate to);
}
