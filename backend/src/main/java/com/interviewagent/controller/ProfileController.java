package com.interviewagent.controller;

import com.interviewagent.dto.UserProfileRequest;
import com.interviewagent.dto.UserProfileResponse;
import com.interviewagent.model.User;
import com.interviewagent.model.UserProfile;
import com.interviewagent.repository.RoadmapRepository;
import com.interviewagent.repository.UserProfileRepository;
import com.interviewagent.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final RoadmapRepository roadmapRepository;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return profileRepository.findByUserId(user.getId())
                .map(p -> ResponseEntity.ok(toResponse(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserProfileResponse> saveProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserProfileRequest request) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(new UserProfile());

        profile.setUser(user);
        profile.setYearsOfExperience(request.getYearsOfExperience());
        profile.setDomain(request.getDomain());
        profile.setCurrentSkills(request.getCurrentSkills());
        profile.setGoal(request.getGoal());
        profile.setCurrentCTC(request.getCurrentCTC());
        profile.setExpectedCTC(request.getExpectedCTC());
        profile.setTimelineMonths(request.getTimelineMonths());
        profile.setWhatsappNumber(request.getWhatsappNumber());

        UserProfile saved = profileRepository.save(profile);
        return ResponseEntity.ok(toResponse(saved));
    }

    private UserProfileResponse toResponse(UserProfile p) {
        UserProfileResponse r = new UserProfileResponse();
        r.setId(p.getId());
        r.setYearsOfExperience(p.getYearsOfExperience());
        r.setDomain(p.getDomain());
        r.setCurrentSkills(p.getCurrentSkills());
        r.setGoal(p.getGoal());
        r.setCurrentCTC(p.getCurrentCTC());
        r.setExpectedCTC(p.getExpectedCTC());
        r.setTimelineMonths(p.getTimelineMonths());
        r.setWhatsappNumber(p.getWhatsappNumber());
        r.setHasRoadmap(roadmapRepository
                .findFirstByUserIdAndStatusOrderByCreatedAtDesc(p.getUser().getId(),
                        com.interviewagent.model.Roadmap.RoadmapStatus.ACTIVE)
                .isPresent());
        return r;
    }
}
