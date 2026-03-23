package com.interviewagent.repository;

import com.interviewagent.model.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {
    List<Roadmap> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Roadmap> findFirstByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Roadmap.RoadmapStatus status);
}
