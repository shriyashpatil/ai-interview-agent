package com.interviewagent.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobApplicationRequest {

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    @NotBlank(message = "Company is required")
    private String company;

    private String jobUrl;
    private String source;      // LINKEDIN, COMPANY_SITE, REFERRAL, OTHER
    private String location;
    private String salary;
    private String jobDescription; // Paste the job listing for cover letter generation
    private String notes;
}
