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
            try {
                HikariConfig config = new HikariConfig();
                config.setJdbcUrl(primaryUrl);
                config.setUsername(primaryUsername);
                config.setPassword(primaryPassword);
                config.setDriverClassName(primaryDriver);
                config.setMaximumPoolSize(10);
                config.setMinimumIdle(2);
                config.setConnectionTimeout(8000); // 8s timeout to avoid blocking deployment
                config.setInitializationFailTimeout(1);
                config.setPoolName("SKMMysqlPool");

                HikariDataSource ds = new HikariDataSource(config);
                try (Connection conn = ds.getConnection()) {
                    log.info("Successfully connected to primary MySQL database: {}", primaryUrl);
                    return ds;
                } catch (Exception connEx) {
                    log.warn("Primary MySQL connection test failed ({}). Activating resilient H2 database fallback.", connEx.getMessage());
                    ds.close();
                }
            } catch (Exception ex) {
                log.warn("Failed to initialize primary MySQL ({}). Activating resilient H2 database fallback.", ex.getMessage());
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
