package com.interviewagent.repository;

import com.interviewagent.model.InterviewSession;
import com.interviewagent.model.ProgressRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProgressRecordRepository extends JpaRepository<ProgressRecord, Long> {
    List<ProgressRecord> findByUserIdOrderByRecordedAtDesc(Long userId);
    List<ProgressRecord> findByUserIdAndCategory(Long userId, InterviewSession.InterviewCategory category);
}
