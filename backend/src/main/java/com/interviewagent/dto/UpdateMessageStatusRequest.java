package com.interviewagent.dto;

import lombok.Data;

@Data
public class UpdateMessageStatusRequest {
    private String status; // DRAFT, SENT, REPLIED, NO_REPLY, FOLLOW_UP_SENT
    private String notes;
    private String sentAt;       // ISO date string
    private String repliedAt;    // ISO date string
}
