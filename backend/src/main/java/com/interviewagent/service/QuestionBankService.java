package com.interviewagent.service;

import com.interviewagent.model.InterviewSession;
import com.interviewagent.model.Question;
import com.interviewagent.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionBankService {

    private final QuestionRepository questionRepository;
    private final ClaudeApiService claudeApiService;

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    public List<Question> getByCategory(InterviewSession.InterviewCategory category) {
        return questionRepository.findByCategory(category);
    }

    public List<Question> getByCategoryAndDifficulty(
            InterviewSession.InterviewCategory category,
            Question.Difficulty difficulty) {
        return questionRepository.findByCategoryAndDifficulty(category, difficulty);
    }

    public Question getQuestion(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
    }

    public String getAiHint(Long questionId) {
        Question question = getQuestion(questionId);
        String prompt = String.format(
                "Give a helpful hint (not the full answer) for this interview question: %s\n\nCategory: %s, Difficulty: %s",
                question.getContent(), question.getCategory(), question.getDifficulty()
        );
        return claudeApiService.chat(
                "You are a helpful interview coach. Provide hints that guide the candidate toward the answer without giving it away.",
                List.of(),
                prompt
        );
    }

    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }
}
