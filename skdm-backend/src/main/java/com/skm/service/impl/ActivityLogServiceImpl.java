package com.skm.service.impl;

import com.skm.entity.ActivityLog;
import com.skm.entity.User;
import com.skm.repository.ActivityLogRepository;
import com.skm.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Override
    @Async
    public void log(User user, String action, String description, String entityType, String entityId, String ipAddress) {
        try {
            ActivityLog activityLog = ActivityLog.builder()
                    .user(user)
                    .username(user != null ? user.getEmail() : "system")
                    .action(action)
                    .description(description)
                    .entityType(entityType)
                    .entityId(entityId)
                    .ipAddress(ipAddress)
                    .performedAt(LocalDateTime.now())
                    .status("SUCCESS")
                    .build();
            activityLogRepository.save(activityLog);
        } catch (Exception e) {
            log.error("Failed to write activity log: {}", e.getMessage());
        }
    }

    @Override
    @Async
    public void logFailure(String username, String action, String description, String ipAddress) {
        try {
            ActivityLog activityLog = ActivityLog.builder()
                    .username(username)
                    .action(action)
                    .description(description)
                    .ipAddress(ipAddress)
                    .performedAt(LocalDateTime.now())
                    .status("FAILURE")
                    .build();
            activityLogRepository.save(activityLog);
        } catch (Exception e) {
            log.error("Failed to write failure activity log: {}", e.getMessage());
        }
    }
}
