package com.interviewagent.repository;

import com.interviewagent.model.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<InterviewSession> findByUserIdAndCategory(Long userId, InterviewSession.InterviewCategory category);
    List<InterviewSession> findByUserIdAndStatus(Long userId, InterviewSession.SessionStatus status);
    long countByUserIdAndStatus(Long userId, InterviewSession.SessionStatus status);
}
