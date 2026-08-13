package com.skm.config;

import com.skm.constants.AppConstants;
import com.skm.entity.*;
import com.skm.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;

import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DataInitializer implements CommandLineRunner {

        private final RoleRepository roleRepository;
        private final UserRepository userRepository;
        private final DepartmentRepository departmentRepository;
        private final CourseRepository courseRepository;
        private final FacultyRepository facultyRepository;
        private final NoticeRepository noticeRepository;
        private final GalleryRepository galleryRepository;
        private final TestimonialRepository testimonialRepository;
        private final EventRepository eventRepository;
        private final FeeStructureRepository feeStructureRepository;
        private final PasswordEncoder passwordEncoder;
        private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

        @Value("${app.admin.default-email:admin@skmahavidyalaya.ac.in}")
        private String adminEmail;

        @Value("${app.admin.default-password:Admin@SKM2024}")
        private String adminPassword;

        @Value("${app.admin.default-name:System Administrator}")
        private String adminName;

        @Override
        public void run(String... args) {
                log.info("Checking and initializing default database records...");
                createTablesIfNotExist();
                initRoles();
                initAdminUser();
                initDepartmentsAndCourses();
                initFeeStructures();
                initFaculty();
                initNotices();
                initGallery();
                initTestimonials();
                initEvents();
                log.info("Database initialization completed successfully.");
        }

        private void createTablesIfNotExist() {
                try {
                        jdbcTemplate.execute(
                                        "CREATE TABLE IF NOT EXISTS course_subjects (" +
                                                        "course_id BIGINT NOT NULL, " +
                                                        "subject VARCHAR(255), " +
                                                        "INDEX idx_course_subjects_course_id (course_id)" +
                                                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
                        jdbcTemplate.execute(
                                        "CREATE TABLE IF NOT EXISTS admission_documents (" +
                                                        "admission_id BIGINT NOT NULL, " +
                                                        "document_url VARCHAR(500), " +
                                                        "INDEX idx_admission_docs_admission_id (admission_id)" +
                                                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
                        log.info("Ensured auxiliary collection tables (course_subjects, admission_documents) exist.");
                } catch (Exception e) {
                        log.warn("Notice during table pre-creation: {}", e.getMessage());
                }
        }

        private void initFeeStructures() {
                if (feeStructureRepository.count() == 0) {
                        String[] sems = {"Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"};
                        for (String sem : sems) {
                                feeStructureRepository.save(FeeStructure.builder()
                                                .courseCode("BA")
                                                .semester(sem)
                                                .academicFee(5000.0)
                                                .sportsFee(500.0)
                                                .examFee(1000.0)
                                                .otherFee(500.0)
                                                .build());

                                feeStructureRepository.save(FeeStructure.builder()
                                                .courseCode("BSC")
                                                .semester(sem)
                                                .academicFee(8000.0)
                                                .sportsFee(500.0)
                                                .examFee(1200.0)
                                                .otherFee(800.0)
                                                .build());
                        }
                        log.info("Initialized default FeeStructures for BA and BSC.");
                }
        }

        private void initRoles() {
                if (!roleRepository.existsByName(AppConstants.ROLE_ADMIN)) {
                        roleRepository.save(Role.builder().name(AppConstants.ROLE_ADMIN)
                                        .description("Administrator Role").build());
                }
                if (!roleRepository.existsByName(AppConstants.ROLE_USER)) {
                        roleRepository.save(Role.builder().name(AppConstants.ROLE_USER)
                                        .description("Standard User Role").build());
                }
        }

        private void initAdminUser() {
                if (!userRepository.existsByEmail(adminEmail)) {
                        Role adminRole = roleRepository.findByName(AppConstants.ROLE_ADMIN).orElseThrow();
                        Role userRole = roleRepository.findByName(AppConstants.ROLE_USER).orElseThrow();

                        User admin = User.builder()
                                        .username("admin")
                                        .email(adminEmail)
                                        .password(passwordEncoder.encode(adminPassword))
                                        .firstName("System")
                                        .lastName("Administrator")
                                        .phone("9876543210")
                                        .active(true)
                                        .emailVerified(true)
                                        .roles(new HashSet<>(Set.of(adminRole)))
                                        .build();

                        userRepository.save(admin);
                        log.info("Default Admin created -> Username: admin | Email: {}", adminEmail);
                }
        }

        private void initDepartmentsAndCourses() {
                if (departmentRepository.count() == 0) {
                        Department arts = departmentRepository.save(Department.builder().name("Arts").code("ARTS")
                                        .establishedYear(2008).active(true).displayOrder(1).build());
                        Department science = departmentRepository.save(Department.builder().name("Science").code("SCI")
                                        .establishedYear(2012).active(true).displayOrder(2).build());
                        Department commerce = departmentRepository
                                        .save(Department.builder().name("Commerce").code("COMM")
                                                        .establishedYear(2012).active(true).displayOrder(3).build());
                        Department cs = departmentRepository
                                        .save(Department.builder().name("Computer Science").code("CS")
                                                        .establishedYear(2016).active(true).displayOrder(4).build());
                        Department edu = departmentRepository.save(Department.builder().name("Education").code("EDU")
                                        .establishedYear(2018).active(true).displayOrder(5).build());

                        if (courseRepository.count() == 0) {
                                courseRepository.save(Course.builder()
                                                .code("BA").name("Bachelor of Arts").shortName("B.A.")
                                                .durationYears(3).totalSeats(240).eligibility("10+2 in any stream")
                                                .tuitionFee(4500.0).otherFee(1200.0).department(arts)
                                                .subjects(List.of("Hindi", "History", "Political Science", "Sociology",
                                                                "Home Science"))
                                                .active(true).displayOrder(1).build());

                                courseRepository.save(Course.builder()
                                                .code("BSC").name("Bachelor of Science").shortName("B.Sc.")
                                                .durationYears(3).totalSeats(120).eligibility("10+2 with Science")
                                                .tuitionFee(7800.0).otherFee(2400.0).department(science)
                                                .subjects(List.of("Physics", "Chemistry", "Mathematics", "Zoology",
                                                                "Botany"))
                                                .active(true).displayOrder(2).build());

                        }
                }
        }

        private void initFaculty() {
                if (facultyRepository.count() == 0) {
                        Department arts = departmentRepository.existsByCode("ARTS")
                                        ? departmentRepository.findByDeletedFalseAndActiveTrueOrderByDisplayOrder()
                                                        .get(0)
                                        : null;
                        Department science = departmentRepository.existsByCode("SCI")
                                        ? departmentRepository.findByDeletedFalseAndActiveTrueOrderByDisplayOrder()
                                                        .get(1)
                                        : null;

                        facultyRepository.save(Faculty.builder()
                                        .name("Dr. Ashok Tiwari").designation("Principal & Associate Professor")
                                        .qualification("Ph.D. in Hindi")
                                        .initials("AT").department(arts).experienceYears(20).active(true)
                                        .displayOrder(1).build());

                        facultyRepository.save(Faculty.builder()
                                        .name("Dr. Meera Srivastava").designation("Head, Department of Science")
                                        .qualification("Ph.D. in Physics")
                                        .initials("MS").department(science).experienceYears(15).active(true)
                                        .displayOrder(2).build());
                }
        }

        private void initNotices() {
                if (noticeRepository.count() == 0) {
                        noticeRepository.save(Notice.builder()
                                        .title("UG admission form (Session 2026–27) submission window extended to Aug 10.")
                                        .content(
                                                        "All candidates applying for UG courses (B.A., B.Sc., B.Com., BCA) can now submit forms up to August 10, 2026.")
                                        .noticeDate(LocalDate.now()).tag("Admission").pinned(true).active(true)
                                        .build());

                        noticeRepository.save(Notice.builder()
                                        .title("Odd-semester examination date-sheet released for all faculties.")
                                        .content(
                                                        "The upcoming semester examination date-sheet has been published. Check details on notice board.")
                                        .noticeDate(LocalDate.now().minusDays(5)).tag("Exam").pinned(false).active(true)
                                        .build());
                }
        }

        private void initGallery() {
                if (galleryRepository.count() == 0) {
                        galleryRepository.save(GalleryItem.builder().caption("Main Campus Building").tag("Campus")
                                        .imageUrl("/uploads/campus.jpg").active(true).displayOrder(1).build());
                        galleryRepository.save(GalleryItem.builder().caption("Annual Sports Meet").tag("Sports")
                                        .imageUrl("/uploads/sports.jpg").active(true).displayOrder(2).build());
                }
        }

        private void initTestimonials() {
                if (testimonialRepository.count() == 0) {
                        testimonialRepository.save(Testimonial.builder()
                                        .studentName("Anjali Verma").batchYear("B.A. 2022 Batch")
                                        .quote("SKM gave me the confidence to speak up in a classroom for the first time in my life.")
                                        .rating(5).active(true).displayOrder(1).build());
                }
        }

        private void initEvents() {
                if (eventRepository.count() == 0) {
                        eventRepository.save(Event.builder()
                                        .title("Annual Founder's Day Function").category("Cultural")
                                        .eventDate(LocalDate.now().plusDays(10)).eventTime("10:00 AM")
                                        .venue("Main Auditorium")
                                        .description("Celebrating the vision of Founder Pandit Ramdeo Dubey Ji.")
                                        .active(true)
                                        .featured(true).build());
                }
        }
}
