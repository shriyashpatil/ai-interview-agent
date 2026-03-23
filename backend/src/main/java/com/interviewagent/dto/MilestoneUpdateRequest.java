package com.interviewagent.dto;

import com.interviewagent.model.RoadmapMilestone;
import lombok.Data;

@Data
public class MilestoneUpdateRequest {
    private RoadmapMilestone.MilestoneStatus status;
}
