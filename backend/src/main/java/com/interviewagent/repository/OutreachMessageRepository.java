package com.interviewagent.repository;

import com.interviewagent.model.OutreachMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface OutreachMessageRepository extends JpaRepository<OutreachMessage, Long> {

    List<OutreachMessage> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<OutreachMessage> findByUserIdAndStatusOrderByCreatedAtDesc(
            Long userId, OutreachMessage.MessageStatus status);

    // Find messages sent X days ago with no reply — candidates for follow-up
    @Query("""
            SELECT m FROM OutreachMessage m
            WHERE m.user.id = :userId
              AND m.status = 'SENT'
              AND m.sentAt <= :cutoffDate
              AND m.followUpScheduledAt IS NULL
            ORDER BY m.sentAt ASC
            """)
    List<OutreachMessage> findSentWithNoFollowUp(
            @Param("userId") Long userId,
            @Param("cutoffDate") LocalDate cutoffDate);

    // Global scheduler query — find all users with follow-ups due today
    @Query("""
            SELECT m FROM OutreachMessage m
            WHERE m.followUpScheduledAt = :today
              AND m.status = 'SENT'
            """)
    List<OutreachMessage> findFollowUpsDueToday(@Param("today") LocalDate today);
}
