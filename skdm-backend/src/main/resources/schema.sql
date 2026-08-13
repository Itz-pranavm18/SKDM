-- Pre-initialize collection and join tables if not created by Hibernate

CREATE TABLE IF NOT EXISTS course_subjects (
    course_id BIGINT NOT NULL,
    subject VARCHAR(255),
    INDEX idx_course_subjects_course_id (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admission_documents (
    admission_id BIGINT NOT NULL,
    document_url VARCHAR(500),
    INDEX idx_admission_docs_admission_id (admission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
