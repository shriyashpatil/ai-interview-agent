package com.interviewagent.dto;

import lombok.Data;

@Data
public class UserProfileResponse {
    private Long id;
    private Integer yearsOfExperience;
    private String domain;
    private String currentSkills;
    private String goal;
    private String currentCTC;
    private String expectedCTC;
    private Integer timelineMonths;
    private String whatsappNumber;
    private boolean hasRoadmap;
}
