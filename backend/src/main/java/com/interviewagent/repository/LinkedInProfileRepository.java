package com.interviewagent.repository;

import com.interviewagent.model.LinkedInProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LinkedInProfileRepository extends JpaRepository<LinkedInProfile, Long> {
    Optional<LinkedInProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
