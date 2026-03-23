package com.interviewagent.controller;

import com.interviewagent.model.InterviewSession;
import com.interviewagent.model.Question;
import com.interviewagent.service.QuestionBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionBankService questionBankService;

    @GetMapping("/public/all")
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionBankService.getAllQuestions());
    }

    @GetMapping("/public/category/{category}")
    public ResponseEntity<List<Question>> getByCategory(
            @PathVariable InterviewSession.InterviewCategory category) {
        return ResponseEntity.ok(questionBankService.getByCategory(category));
    }

    @GetMapping("/public/filter")
    public ResponseEntity<List<Question>> filter(
            @RequestParam InterviewSession.InterviewCategory category,
            @RequestParam Question.Difficulty difficulty) {
        return ResponseEntity.ok(questionBankService.getByCategoryAndDifficulty(category, difficulty));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestion(@PathVariable Long id) {
        return ResponseEntity.ok(questionBankService.getQuestion(id));
    }

    @GetMapping("/{id}/hint")
    public ResponseEntity<?> getHint(@PathVariable Long id) {
        String hint = questionBankService.getAiHint(id);
        return ResponseEntity.ok(Map.of("hint", hint));
    }

    @PostMapping
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        return ResponseEntity.ok(questionBankService.createQuestion(question));
    }
}
