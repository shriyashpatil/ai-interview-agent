package com.interviewagent.service;

import com.interviewagent.model.InterviewSession;
import com.interviewagent.model.ProgressRecord;
import com.interviewagent.repository.InterviewSessionRepository;
import com.interviewagent.repository.ProgressRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ProgressRecordRepository progressRecordRepository;
    private final InterviewSessionRepository sessionRepository;

    public List<ProgressRecord> getUserProgress(Long userId) {
        return progressRecordRepository.findByUserIdOrderByRecordedAtDesc(userId);
    }

    public List<ProgressRecord> getUserProgressByCategory(Long userId, InterviewSession.InterviewCategory category) {
        return progressRecordRepository.findByUserIdAndCategory(userId, category);
    }

    public Map<String, Object> getUserStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();

        List<ProgressRecord> allRecords = progressRecordRepository.findByUserIdOrderByRecordedAtDesc(userId);
        long completedSessions = sessionRepository.countByUserIdAndStatus(userId, InterviewSession.SessionStatus.COMPLETED);

        stats.put("totalSessions", completedSessions);
        stats.put("totalQuestionsAttempted", allRecords.stream()
                .mapToInt(r -> r.getQuestionsAttempted() != null ? r.getQuestionsAttempted() : 0)
                .sum());

        double averageScore = allRecords.stream()
                .filter(r -> r.getScore() != null)
                .mapToInt(ProgressRecord::getScore)
                .average()
                .orElse(0.0);
        stats.put("averageScore", Math.round(averageScore * 10.0) / 10.0);

        // Score by category
        Map<String, Double> categoryScores = new HashMap<>();
        for (InterviewSession.InterviewCategory cat : InterviewSession.InterviewCategory.values()) {
            double catAvg = allRecords.stream()
                    .filter(r -> r.getCategory() == cat && r.getScore() != null)
                    .mapToInt(ProgressRecord::getScore)
                    .average()
                    .orElse(0.0);
            if (catAvg > 0) {
                categoryScores.put(cat.name(), Math.round(catAvg * 10.0) / 10.0);
            }
        }
        stats.put("categoryScores", categoryScores);

        return stats;
    }
}
