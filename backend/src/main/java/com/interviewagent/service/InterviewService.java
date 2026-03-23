package com.interviewagent.service;

import com.interviewagent.dto.StartSessionRequest;
import com.interviewagent.model.*;
import com.interviewagent.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final MessageRepository messageRepository;
    private final ClaudeApiService claudeApiService;
    private final ProgressRecordRepository progressRecordRepository;

    private static final String MOCK_INTERVIEW_SYSTEM_PROMPT = """
            You are an expert interview coach conducting a mock interview. Your role:

            1. Ask one interview question at a time
            2. Wait for the candidate's response
            3. Provide constructive feedback on their answer
            4. Ask follow-up questions when appropriate
            5. Adapt difficulty based on the candidate's performance
            6. Be encouraging but honest about areas for improvement

            Interview category: %s

            Start by introducing yourself and asking the first question.
            Keep responses focused and concise.
            """;

    private static final String QUESTION_PRACTICE_PROMPT = """
            You are an expert interview coach helping a candidate practice interview questions.
            Category: %s

            When the candidate answers a question:
            1. Evaluate their response for completeness, accuracy, and communication clarity
            2. Provide a score from 1-10
            3. Explain what was good and what could be improved
            4. Provide a model answer for comparison
            5. Suggest a follow-up question if relevant

            Be supportive and educational in your feedback.
            """;

    @Transactional
    public InterviewSession startSession(User user, StartSessionRequest request) {
        String systemPrompt = request.getInterviewType() == InterviewSession.InterviewType.MOCK_INTERVIEW
                ? String.format(MOCK_INTERVIEW_SYSTEM_PROMPT, request.getCategory())
                : String.format(QUESTION_PRACTICE_PROMPT, request.getCategory());

        InterviewSession session = InterviewSession.builder()
                .user(user)
                .interviewType(request.getInterviewType())
                .category(request.getCategory())
                .status(InterviewSession.SessionStatus.IN_PROGRESS)
                .build();
        session = sessionRepository.save(session);

        // Get the initial AI message to kick off the session
        String aiResponse = claudeApiService.chat(systemPrompt, List.of(), "Start the interview session.");

        // Save system prompt as a system message
        Message systemMessage = Message.builder()
                .session(session)
                .role(Message.Role.SYSTEM)
                .content(systemPrompt)
                .build();
        messageRepository.save(systemMessage);

        // Save AI's opening message
        Message aiMessage = Message.builder()
                .session(session)
                .role(Message.Role.ASSISTANT)
                .content(aiResponse)
                .build();
        messageRepository.save(aiMessage);

        return session;
    }

    @Transactional
    public Message sendMessage(Long sessionId, User user, String userMessage) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to session");
        }

        if (session.getStatus() != InterviewSession.SessionStatus.IN_PROGRESS) {
            throw new RuntimeException("Session is no longer active");
        }

        // Save user message
        Message userMsg = Message.builder()
                .session(session)
                .role(Message.Role.USER)
                .content(userMessage)
                .build();
        messageRepository.save(userMsg);

        // Get conversation history (excluding system messages for the API call)
        List<Message> history = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .filter(m -> m.getRole() != Message.Role.SYSTEM)
                .toList();

        // Get the system prompt from the first message
        String systemPrompt = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .filter(m -> m.getRole() == Message.Role.SYSTEM)
                .findFirst()
                .map(Message::getContent)
                .orElse("");

        // Remove the last message (current user message) from history since we pass it separately
        List<Message> previousMessages = history.subList(0, history.size() - 1);

        String aiResponse = claudeApiService.chat(systemPrompt, previousMessages, userMessage);

        Message aiMsg = Message.builder()
                .session(session)
                .role(Message.Role.ASSISTANT)
                .content(aiResponse)
                .build();
        return messageRepository.save(aiMsg);
    }

    @Transactional
    public InterviewSession endSession(Long sessionId, User user) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to session");
        }

        // Get final feedback from Claude
        List<Message> history = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .filter(m -> m.getRole() != Message.Role.SYSTEM)
                .toList();

        String feedbackPrompt = """
                The interview session is ending. Please provide:
                1. An overall score from 1-100
                2. Key strengths demonstrated
                3. Areas for improvement
                4. Specific recommendations for future preparation

                Format: Start with "SCORE: XX" on the first line, then provide your detailed feedback.
                """;

        String systemPrompt = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .filter(m -> m.getRole() == Message.Role.SYSTEM)
                .findFirst()
                .map(Message::getContent)
                .orElse("");

        String feedback = claudeApiService.chat(systemPrompt, history, feedbackPrompt);

        // Parse score from feedback
        int score = parseScore(feedback);

        session.setStatus(InterviewSession.SessionStatus.COMPLETED);
        session.setOverallScore(score);
        session.setAiFeedback(feedback);
        session.setCompletedAt(LocalDateTime.now());

        // Save progress record
        ProgressRecord record = ProgressRecord.builder()
                .user(user)
                .category(session.getCategory())
                .score(score)
                .questionsAttempted((int) history.stream().filter(m -> m.getRole() == Message.Role.USER).count())
                .build();
        progressRecordRepository.save(record);

        return sessionRepository.save(session);
    }

    public List<InterviewSession> getUserSessions(Long userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public InterviewSession getSession(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }

    public List<Message> getSessionMessages(Long sessionId) {
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .filter(m -> m.getRole() != Message.Role.SYSTEM)
                .toList();
    }

    private int parseScore(String feedback) {
        try {
            String[] lines = feedback.split("\n");
            for (String line : lines) {
                if (line.toUpperCase().startsWith("SCORE:")) {
                    return Integer.parseInt(line.replaceAll("[^0-9]", "").trim());
                }
            }
        } catch (Exception e) {
            log.warn("Could not parse score from feedback, defaulting to 50");
        }
        return 50;
    }
}
