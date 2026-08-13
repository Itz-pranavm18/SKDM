package com.skm.repository;

import com.skm.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    Optional<OtpToken> findFirstByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(String email, String purpose);

    @Modifying
    @Query("UPDATE OtpToken o SET o.used = true WHERE o.email = :email AND o.purpose = :purpose")
    void invalidateAll(@Param("email") String email, @Param("purpose") String purpose);

    @Modifying
    @Query("DELETE FROM OtpToken o WHERE o.expiresAt < :now OR o.used = true")
    void deleteExpiredAndUsed(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE OtpToken o SET o.attempts = o.attempts + 1 WHERE o.id = :id")
    void incrementAttempts(@Param("id") Long id);
}
