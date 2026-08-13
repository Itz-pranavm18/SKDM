# Shiv Kumari Mahavidyalaya (SKM) — Enterprise Backend API

A complete, production-ready Spring Boot 3.x RESTful backend for **Shiv Kumari Mahavidyalaya (SKM)** college management system built with Java 21, Spring Security 6, Spring Data JPA, Hibernate, MySQL, and JWT Authentication.

---

## 🚀 Key Features

- **Authentication & Security:**
  - JWT Access & Refresh Token mechanism with revocation
  - BCrypt Password Hashing (strength 12)
  - Account lockout after consecutive failed login attempts
  - OTP support for Password Reset & Email Verification
  - Role-Based Authorization (`ROLE_ADMIN`, `ROLE_USER`)
  - Stateless session management with custom 401/403 handlers
  - Configurable CORS policy

- **Core Domains & Management:**
  - **User Management:** Full CRUD, search, filter, suspend, activate, role assignment, password reset
  - **Admissions Engine:** Online application submission, document URL attachments, admin review (Approve/Reject), automatic application number generation, email notifications
  - **Course & Department Management:** Multi-department course catalog, subject lists, fee structure, seat availability
  - **Faculty Directory:** Faculty profiles, designations, qualifications, experience, department mapping
  - **Notice Board & Events:** Timed notice publication, tagging, pinning, expiry date handling, campus events
  - **Gallery & Testimonials:** Categorized image gallery, student testimonials with rating
  - **Contact & Enquiries:** Public contact form submission with IP tracking and email acknowledgement

- **Enterprise Infrastructure:**
  - **Global Exception Handling:** Standardized `ApiResponse<T>` wrapper for all responses and errors
  - **Caffeine In-Memory Caching:** `@Cacheable` and `@CacheEvict` for public endpoints (courses, notices, faculty, gallery)
  - **Auditing & Soft Delete:** Automatic JPA Auditing (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`) + soft delete support (`is_deleted`)
  - **Async Email Service:** Multi-template HTML email notifications for registration, password reset, admission status updates
  - **OpenAPI / Swagger:** Interactive API documentation available at `/swagger-ui.html`
  - **Docker Support:** Multi-stage `Dockerfile` and `docker-compose.yml`

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| **Language** | Java 21 LTS |
| **Framework** | Spring Boot 3.2.5 |
| **Security** | Spring Security 6 & JJWT 0.12.5 |
| **Persistence** | Spring Data JPA & Hibernate 6 |
| **Database** | MySQL 8.0 |
| **Caching** | Caffeine Cache |
| **Documentation** | SpringDoc OpenAPI 2.3 (Swagger UI) |
| **Build Tool** | Apache Maven 3.9+ |
| **Containerization** | Docker & Docker Compose |

---

## 💻 Database Setup (MySQL)

Ensure MySQL 8.0+ is running locally on port `3306`:

- **Database:** `college_management` (created automatically if missing)
- **Host:** `localhost:3306`
- **Username:** `root`
- **Password:** `mysql123`

---

## ⚡ Quick Start Guide

### Option 1: Run Locally with Maven

1. **Build the application:**
   ```bash
   cd skdm-backend
   mvn clean package -DskipTests
   ```

2. **Run the Spring Boot application:**
   ```bash
   mvn spring-boot:run
   ```
   The backend server will start at `http://localhost:8080`.

---

### Option 2: Run with Docker Compose

To launch MySQL and the Spring Boot backend inside containers:

```bash
cd skdm-backend
docker-compose up --build -d
```

---

## 🔑 Default Credentials & Seed Data

On startup, the system seeds initial default data:

- **Default Admin Account:**
  - **Email:** `admin@skmahavidyalaya.ac.in`
  - **Username:** `admin`
  - **Password:** `Admin@SKM2024`
  - **Role:** `ROLE_ADMIN`, `ROLE_USER`

---

## 📑 API Documentation & Swagger

Once the backend is running, access the interactive Swagger UI at:
👉 **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**

OpenAPI Spec endpoint:
👉 `http://localhost:8080/v3/api-docs`

---

## 📋 Endpoint Summary

### Auth (`/api/v1/auth`)
- `POST /api/v1/auth/signup` — User Registration
- `POST /api/v1/auth/login` — Authenticate & Receive JWT
- `POST /api/v1/auth/refresh-token` — Refresh Access Token
- `POST /api/v1/auth/logout` — Revoke Refresh Token
- `POST /api/v1/auth/forgot-password` — Request OTP
- `POST /api/v1/auth/reset-password` — Reset Password with OTP
- `GET  /api/v1/auth/profile` — Get User Profile
- `PUT  /api/v1/auth/profile` — Update Profile

### Public Content (`/api/v1`)
- `GET  /api/v1/courses` — Active Courses
- `GET  /api/v1/faculty` — Faculty Members
- `GET  /api/v1/notices` — Active Notice Board
- `GET  /api/v1/gallery` — Photo Gallery
- `POST /api/v1/contact` — Submit Contact Form

### Admissions (`/api/v1/admissions`)
- `POST /api/v1/admissions` — Apply for Admission (User)
- `GET  /api/v1/admissions/my` — Get User's Applications

### Admin (`/api/v1/admin`)
- `GET   /api/v1/admin/dashboard` — Stats, Graphs Data & Activity Logs
- `GET   /api/v1/admin/users` — Search/Filter All Users
- `PATCH /api/v1/admin/users/{id}/suspend` — Suspend User
- `PATCH /api/v1/admin/users/{id}/activate` — Activate User
- `PATCH /api/v1/admin/admissions/{id}/approve` — Approve Admission
- `PATCH /api/v1/admin/admissions/{id}/reject` — Reject Admission

---

## 🧪 Testing

Run unit & integration test suite:
```bash
mvn test
```
