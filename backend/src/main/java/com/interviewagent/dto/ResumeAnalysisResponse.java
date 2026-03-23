package com.interviewagent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAnalysisResponse {
    private String overallAssessment;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> suggestedImprovements;
    private List<String> likelyInterviewQuestions;
    private String roleRecommendation;
}
