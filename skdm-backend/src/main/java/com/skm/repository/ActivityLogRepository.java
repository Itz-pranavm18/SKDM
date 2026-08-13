package com.skm.repository;

import com.skm.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    Page<ActivityLog> findByOrderByPerformedAtDesc(Pageable pageable);
    Page<ActivityLog> findByUserIdOrderByPerformedAtDesc(Long userId, Pageable pageable);
    List<ActivityLog> findTop20ByOrderByPerformedAtDesc();

    @Modifying
    @Query("DELETE FROM ActivityLog a WHERE a.performedAt < :before")
    void deleteOlderThan(@Param("before") LocalDateTime before);
}
