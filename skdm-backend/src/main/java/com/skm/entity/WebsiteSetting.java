package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "website_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WebsiteSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "setting_key", unique = true, nullable = false, length = 100)
    private String settingKey;

    @Column(name = "setting_value", length = 5000)
    private String settingValue;

    @Column(name = "setting_type", length = 30)
    @Builder.Default
    private String settingType = "TEXT"; // TEXT, JSON, BOOLEAN, NUMBER

    @Column(name = "description", length = 300)
    private String description;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private boolean publicSetting = false;
}
