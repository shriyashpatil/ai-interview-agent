package com.interviewagent.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserProfileRequest {

    @NotNull @Min(0) @Max(40)
    private Integer yearsOfExperience;

    @NotBlank
    private String domain;

    private String currentSkills;

    @NotBlank @Size(max = 500)
    private String goal;

    private String currentCTC;
    private String expectedCTC;

    @NotNull @Min(3) @Max(24)
    private Integer timelineMonths;

    private String whatsappNumber; // e.g. "+919876543210"
}
