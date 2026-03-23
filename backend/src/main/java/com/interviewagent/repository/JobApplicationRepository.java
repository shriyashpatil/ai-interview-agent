package com.interviewagent.repository;

import com.interviewagent.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<JobApplication> findByUserIdAndStatusOrderByCreatedAtDesc(
            Long userId, JobApplication.ApplicationStatus status);

    @Query("""
            SELECT j FROM JobApplication j
            WHERE j.user.id = :userId
              AND j.status IN ('APPLIED', 'SCREENING', 'INTERVIEW')
            ORDER BY j.appliedAt ASC
            """)
    List<JobApplication> findActiveApplications(@Param("userId") Long userId);

    // Follow-up reminders due today
    @Query("""
            SELECT j FROM JobApplication j
            WHERE j.followUpDate = :today
              AND j.status IN ('APPLIED', 'SCREENING')
            """)
    List<JobApplication> findFollowUpsDueToday(@Param("today") LocalDate today);

    @Query("""
            SELECT COUNT(j) FROM JobApplication j
            WHERE j.user.id = :userId AND j.status = :status
            """)
    long countByUserIdAndStatus(
            @Param("userId") Long userId,
            @Param("status") JobApplication.ApplicationStatus status);
}
