package com.skm.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.orm.jpa.EntityManagerFactoryDependsOnPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
        log.info("Starting mandatory database table pre-creation on DataSource...");

        String[] createTableSqls = new String[] {
            "CREATE TABLE IF NOT EXISTS roles (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50) NOT NULL UNIQUE, description VARCHAR(255)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS users (id BIGINT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, email VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, first_name VARCHAR(50) NOT NULL, last_name VARCHAR(50) NOT NULL, phone VARCHAR(15), is_active BOOLEAN NOT NULL DEFAULT TRUE, email_verified BOOLEAN NOT NULL DEFAULT FALSE, failed_login_attempts INT NOT NULL DEFAULT 0, locked_until DATETIME, created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS user_roles (user_id BIGINT NOT NULL, role_id BIGINT NOT NULL, PRIMARY KEY (user_id, role_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS departments (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, code VARCHAR(20) NOT NULL UNIQUE, description VARCHAR(1000), established_year INT, is_active BOOLEAN NOT NULL DEFAULT TRUE, display_order INT DEFAULT 0, created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS courses (id BIGINT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(20) NOT NULL UNIQUE, name VARCHAR(200) NOT NULL, short_name VARCHAR(20), description VARCHAR(2000), duration_years INT NOT NULL, total_seats INT NOT NULL, eligibility VARCHAR(500), tuition_fee DOUBLE, other_fee DOUBLE, is_active BOOLEAN NOT NULL DEFAULT TRUE, display_order INT DEFAULT 0, department_id BIGINT, created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS course_subjects (id BIGINT AUTO_INCREMENT PRIMARY KEY, course_id BIGINT NOT NULL, subject VARCHAR(255), INDEX idx_course_subjects_course_id (course_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS admissions (id BIGINT AUTO_INCREMENT PRIMARY KEY, application_number VARCHAR(50) NOT NULL UNIQUE, user_id BIGINT, course_id BIGINT, academic_year VARCHAR(20), status VARCHAR(30) NOT NULL DEFAULT 'PENDING', father_name VARCHAR(100), mother_name VARCHAR(100), date_of_birth DATE, gender VARCHAR(10), blood_group VARCHAR(5), aadhaar_number VARCHAR(20), address VARCHAR(500), city VARCHAR(50), state VARCHAR(50), pincode VARCHAR(10), tenth_percentage DOUBLE, twelfth_percentage DOUBLE, graduation_percentage DOUBLE, category VARCHAR(20), sub_category VARCHAR(50), photo_url VARCHAR(500), reviewed_by VARCHAR(100), reviewed_at DATETIME, rejection_reason VARCHAR(500), remarks VARCHAR(500), created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS admission_documents (id BIGINT AUTO_INCREMENT PRIMARY KEY, admission_id BIGINT NOT NULL, document_url VARCHAR(500), INDEX idx_admission_docs_admission_id (admission_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS faculty (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, designation VARCHAR(100), qualification VARCHAR(200), experience_years INT, email VARCHAR(100), phone VARCHAR(20), photo_url VARCHAR(500), specialization VARCHAR(200), department_id BIGINT, is_active BOOLEAN NOT NULL DEFAULT TRUE, display_order INT DEFAULT 0, created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS fee_structures (id BIGINT AUTO_INCREMENT PRIMARY KEY, course_code VARCHAR(20) NOT NULL, semester VARCHAR(50) NOT NULL, academic_fee DOUBLE, sports_fee DOUBLE, exam_fee DOUBLE, other_fee DOUBLE, created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS notices (id BIGINT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(300) NOT NULL, content TEXT, category VARCHAR(50), attachment_url VARCHAR(500), publish_date DATE, expiry_date DATE, is_active BOOLEAN NOT NULL DEFAULT TRUE, is_pinned BOOLEAN NOT NULL DEFAULT FALSE, views_count INT DEFAULT 0, created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS gallery_items (id BIGINT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200), description VARCHAR(1000), image_url VARCHAR(500) NOT NULL, category VARCHAR(50), is_active BOOLEAN NOT NULL DEFAULT TRUE, display_order INT DEFAULT 0, created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS testimonials (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, role VARCHAR(100), message VARCHAR(2000) NOT NULL, photo_url VARCHAR(500), rating INT DEFAULT 5, is_active BOOLEAN NOT NULL DEFAULT TRUE, display_order INT DEFAULT 0, created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS events (id BIGINT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200) NOT NULL, description TEXT, event_date DATETIME, location VARCHAR(200), image_url VARCHAR(500), is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS contact_messages (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(100) NOT NULL, phone VARCHAR(20), subject VARCHAR(200), message TEXT NOT NULL, is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS otp_tokens (id BIGINT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(100) NOT NULL, otp_code VARCHAR(10) NOT NULL, purpose VARCHAR(50) NOT NULL, expiry_time DATETIME NOT NULL, used BOOLEAN NOT NULL DEFAULT FALSE, created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS refresh_tokens (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, token VARCHAR(500) NOT NULL UNIQUE, expiry_date DATETIME NOT NULL, revoked BOOLEAN NOT NULL DEFAULT FALSE, created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS uploaded_files (id BIGINT AUTO_INCREMENT PRIMARY KEY, original_name VARCHAR(255) NOT NULL, stored_name VARCHAR(255) NOT NULL, file_url VARCHAR(500) NOT NULL, file_type VARCHAR(100), file_size BIGINT, uploaded_by_user_id BIGINT, created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS website_settings (id BIGINT AUTO_INCREMENT PRIMARY KEY, setting_key VARCHAR(100) NOT NULL UNIQUE, setting_value TEXT, setting_group VARCHAR(50), description VARCHAR(255), created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS student_semester_fees (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, semester VARCHAR(50) NOT NULL, total_amount DOUBLE, paid_amount DOUBLE, due_amount DOUBLE, status VARCHAR(30) DEFAULT 'PENDING', due_date DATE, created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS fee_payment_requests (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, semester VARCHAR(50) NOT NULL, amount DOUBLE NOT NULL, payment_mode VARCHAR(50), transaction_id VARCHAR(100), status VARCHAR(30) DEFAULT 'PENDING', remarks VARCHAR(500), created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS fee_payment_receipts (id BIGINT AUTO_INCREMENT PRIMARY KEY, receipt_number VARCHAR(100) NOT NULL UNIQUE, user_id BIGINT NOT NULL, payment_request_id BIGINT, amount DOUBLE NOT NULL, payment_date DATETIME, pdf_url VARCHAR(500), created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
            "CREATE TABLE IF NOT EXISTS activity_logs (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT, action VARCHAR(100) NOT NULL, details TEXT, ip_address VARCHAR(50), created_at DATETIME, updated_at DATETIME, created_by VARCHAR(255), updated_by VARCHAR(255), is_deleted BOOLEAN DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
        };

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            for (String sql : createTableSqls) {
                try {
                    stmt.execute(sql);
                } catch (Exception sqlEx) {
                    log.debug("Notice on table pre-creation sql ({}): {}", sql, sqlEx.getMessage());
                }
            }
            log.info("Database table pre-creation / verification step finished successfully.");
        } catch (Exception e) {
            log.warn("Database pre-creation warning: {}. JPA DDL will handle schema management.", e.getMessage());
        }

        return true;
    }
}
