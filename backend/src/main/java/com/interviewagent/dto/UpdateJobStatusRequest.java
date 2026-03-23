package com.interviewagent.dto;

import lombok.Data;

@Data
public class UpdateJobStatusRequest {
    private String status;        // WISHLIST, APPLIED, SCREENING, INTERVIEW, OFFER, REJECTED, WITHDRAWN
    private String appliedAt;     // ISO date string
    private String followUpDate;  // ISO date string
    private String interviewDate; // ISO date string
    private String notes;
}
