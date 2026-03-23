package com.interviewagent.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileOptimizeRequest {

    @NotBlank(message = "Profile text is required")
    private String rawProfileText; // Full copy-paste of LinkedIn profile

    private String targetRole;    // Optional: role they're targeting
    private String targetCompany; // Optional: company they're targeting
}
