package com.skm.repository;

import com.skm.entity.WebsiteSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WebsiteSettingRepository extends JpaRepository<WebsiteSetting, Long> {
    Optional<WebsiteSetting> findBySettingKey(String settingKey);
    List<WebsiteSetting> findByPublicSettingTrue();
}
