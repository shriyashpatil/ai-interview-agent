package com.interviewagent.dto;

import com.interviewagent.model.InterviewSession;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartSessionRequest {
    @NotNull
    private InterviewSession.InterviewType interviewType;

    @NotNull
    private InterviewSession.InterviewCategory category;
}
