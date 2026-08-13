package com.skm.service;

import com.skm.entity.ActivityLog;
import com.skm.entity.User;

public interface ActivityLogService {
    void log(User user, String action, String description, String entityType, String entityId, String ipAddress);
    void logFailure(String username, String action, String description, String ipAddress);
}
