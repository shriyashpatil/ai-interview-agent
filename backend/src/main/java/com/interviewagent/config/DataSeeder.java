package com.interviewagent.config;

import com.interviewagent.model.InterviewSession;
import com.interviewagent.model.Question;
import com.interviewagent.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final QuestionRepository questionRepository;

    @Override
    public void run(String... args) {
        if (questionRepository.count() > 0) return;

        // Software Engineering questions
        seed("Two Sum", "Given an array of integers and a target sum, return indices of two numbers that add up to the target.",
                InterviewSession.InterviewCategory.SOFTWARE_ENGINEERING, Question.Difficulty.EASY,
                "Use a HashMap to store complements. For each number, check if its complement exists in the map.", "arrays,hashmap,leetcode");

        seed("System Design: URL Shortener", "Design a URL shortening service like bit.ly. Consider scalability, storage, and redirection.",
                InterviewSession.InterviewCategory.SYSTEM_DESIGN, Question.Difficulty.MEDIUM,
                "Use base62 encoding, discuss database choices (SQL vs NoSQL), caching with Redis, and load balancing.", "system-design,scalability");

        seed("Explain Microservices vs Monolith", "Compare microservices and monolithic architecture. When would you choose one over the other?",
                InterviewSession.InterviewCategory.SOFTWARE_ENGINEERING, Question.Difficulty.MEDIUM,
                "Discuss trade-offs: deployment complexity, team autonomy, data consistency, scaling patterns.", "architecture,microservices");

        // Data Science questions
        seed("Bias-Variance Tradeoff", "Explain the bias-variance tradeoff in machine learning. How does it affect model selection?",
                InterviewSession.InterviewCategory.DATA_SCIENCE, Question.Difficulty.MEDIUM,
                "High bias = underfitting, high variance = overfitting. Cross-validation helps find the sweet spot.", "ml,fundamentals");

        seed("A/B Testing", "How would you design an A/B test to measure the impact of a new feature on user engagement?",
                InterviewSession.InterviewCategory.DATA_SCIENCE, Question.Difficulty.MEDIUM,
                "Define hypothesis, choose metrics, calculate sample size, ensure randomization, check for statistical significance.", "statistics,experimentation");

        // Behavioral questions
        seed("Tell Me About a Conflict", "Describe a time you had a conflict with a teammate. How did you resolve it?",
                InterviewSession.InterviewCategory.BEHAVIORAL, Question.Difficulty.EASY,
                "Use the STAR method: Situation, Task, Action, Result. Focus on collaboration and growth.", "behavioral,star");

        seed("Leadership Under Pressure", "Tell me about a time you had to lead a team through a tight deadline or crisis.",
                InterviewSession.InterviewCategory.BEHAVIORAL, Question.Difficulty.HARD,
                "Emphasize prioritization, communication, delegation, and how you kept morale up.", "behavioral,leadership");

        // Product/Business questions
        seed("Product Metrics", "You're the PM for Instagram Stories. What metrics would you track and why?",
                InterviewSession.InterviewCategory.PRODUCT_BUSINESS, Question.Difficulty.MEDIUM,
                "DAU/MAU, stories created per user, completion rate, shares, replies. Tie each to a business goal.", "product,metrics");

        seed("Market Sizing", "Estimate the number of gas stations in the United States.",
                InterviewSession.InterviewCategory.PRODUCT_BUSINESS, Question.Difficulty.EASY,
                "Top-down: ~330M people, ~280M cars, average fill-up once/week, station serves ~250 cars/day → ~150K stations.", "estimation,case");

        // General
        seed("Why This Company?", "Why do you want to work at our company? What excites you about this role?",
                InterviewSession.InterviewCategory.GENERAL, Question.Difficulty.EASY,
                "Research the company mission, recent news, and product. Connect your skills and passion to their needs.", "general,motivation");
    }

    private void seed(String title, String content, InterviewSession.InterviewCategory category,
                      Question.Difficulty difficulty, String sampleAnswer, String tags) {
        questionRepository.save(Question.builder()
                .title(title)
                .content(content)
                .category(category)
                .difficulty(difficulty)
                .sampleAnswer(sampleAnswer)
                .tags(tags)
                .build());
    }
}
