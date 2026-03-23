package com.interviewagent.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GenerateMessageRequest {

    @NotBlank(message = "Target name is required")
    private String targetName;

    private String targetRole;        // e.g. "Engineering Manager"

    @NotBlank(message = "Target company is required")
    private String targetCompany;

    private String targetLinkedInUrl;
    private String jobTitle;          // The role user is targeting at this company
    private String additionalContext; // Extra info: mutual connection, specific interest, etc.
}
