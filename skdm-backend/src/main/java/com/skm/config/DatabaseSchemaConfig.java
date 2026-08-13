package com.skm.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;

@Configuration
@Slf4j
public class DatabaseSchemaConfig {

    @Bean
    public ResourceDatabasePopulator databasePopulator(DataSource dataSource) {
        log.info("Executing database pre-initialization DDL script on DataSource prior to JPA startup...");
        try {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            populator.addScript(new ClassPathResource("schema.sql"));
            populator.setContinueOnError(true);
            populator.execute(dataSource);
            log.info("Database pre-initialization DDL completed successfully.");
            return populator;
        } catch (Exception e) {
            log.warn("Database pre-initialization notice: {}", e.getMessage());
            return new ResourceDatabasePopulator();
        }
    }
}
