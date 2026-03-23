package com.interviewagent.repository;

import com.interviewagent.model.InterviewSession;
import com.interviewagent.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByCategory(InterviewSession.InterviewCategory category);
    List<Question> findByCategoryAndDifficulty(InterviewSession.InterviewCategory category, Question.Difficulty difficulty);
    List<Question> findByDifficulty(Question.Difficulty difficulty);
}
