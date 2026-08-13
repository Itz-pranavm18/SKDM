package com.skm.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.orm.jpa.EntityManagerFactoryDependsOnPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@Configuration
@Slf4j
public class DatabaseSchemaConfig extends EntityManagerFactoryDependsOnPostProcessor {

    public DatabaseSchemaConfig() {
        super("databaseInitializer");
    }

    @Bean(name = "databaseInitializer")
    public Boolean databaseInitializer(DataSource dataSource) {
        log.info("Executing database pre-initialization DDL script directly on DataSource BEFORE EntityManagerFactory...");
        try {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            populator.addScript(new ClassPathResource("schema.sql"));
            populator.setContinueOnError(true);
            populator.execute(dataSource);
            log.info("Database pre-initialization DDL completed successfully.");
        } catch (Exception e) {
            log.warn("Database pre-initialization notice: {}", e.getMessage());
        }

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("CREATE TABLE IF NOT EXISTS course_subjects (course_id BIGINT NOT NULL, subject VARCHAR(255), INDEX idx_course_subjects_course_id (course_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
            stmt.execute("CREATE TABLE IF NOT EXISTS admission_documents (admission_id BIGINT NOT NULL, document_url VARCHAR(500), INDEX idx_admission_docs_admission_id (admission_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
            stmt.execute("CREATE TABLE IF NOT EXISTS user_roles (user_id BIGINT NOT NULL, role_id BIGINT NOT NULL, PRIMARY KEY (user_id, role_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
            log.info("Fail-safe table creation for course_subjects, admission_documents, and user_roles verified.");
        } catch (Exception e) {
            log.warn("Fail-safe table creation notice: {}", e.getMessage());
        }

        return true;
    }
}
