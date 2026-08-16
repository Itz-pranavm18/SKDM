package com.skm.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;

@Configuration
@Slf4j
public class DataSourceConfig {

    @Value("${spring.datasource.url:}")
    private String primaryUrl;

    @Value("${spring.datasource.username:root}")
    private String primaryUsername;

    @Value("${spring.datasource.password:root}")
    private String primaryPassword;

    @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String primaryDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        log.info("Evaluating DataSource configuration with target URL: {}", primaryUrl);

        if (primaryUrl != null && !primaryUrl.isBlank() && !primaryUrl.contains("localhost")) {
            boolean connectionOk = false;
            try {
                Class.forName(primaryDriver);
                java.sql.DriverManager.setLoginTimeout(5);
                try (Connection testConn = java.sql.DriverManager.getConnection(primaryUrl, primaryUsername, primaryPassword)) {
                    if (testConn != null && !testConn.isClosed()) {
                        connectionOk = true;
                        log.info("Primary MySQL connection verified successfully: {}", primaryUrl);
                    }
                }
            } catch (Throwable t) {
                log.warn("Primary MySQL connectivity check failed ({}). Activating resilient H2 fallback database.", t.getMessage());
            }

            if (connectionOk) {
                try {
                    HikariConfig config = new HikariConfig();
                    config.setJdbcUrl(primaryUrl);
                    config.setUsername(primaryUsername);
                    config.setPassword(primaryPassword);
                    config.setDriverClassName(primaryDriver);
                    config.setMaximumPoolSize(10);
                    config.setMinimumIdle(2);
                    config.setConnectionTimeout(8000);
                    config.setInitializationFailTimeout(-1);
                    config.setPoolName("SKMMysqlPool");
                    return new HikariDataSource(config);
                } catch (Throwable ex) {
                    log.warn("Failed to create Hikari MySQL DataSource ({}). Activating fallback.", ex.getMessage());
                }
            }
        }

        log.info("Starting resilient local database in MySQL compatibility mode...");
        HikariConfig h2Config = new HikariConfig();
        h2Config.setJdbcUrl("jdbc:h2:file:./data/skm_db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;AUTO_SERVER=TRUE;DB_CLOSE_DELAY=-1");
        h2Config.setDriverClassName("org.h2.Driver");
        h2Config.setUsername("sa");
        h2Config.setPassword("");
        h2Config.setMaximumPoolSize(10);
        h2Config.setMinimumIdle(2);
        h2Config.setPoolName("SKMH2FallbackPool");
        return new HikariDataSource(h2Config);
    }
}
