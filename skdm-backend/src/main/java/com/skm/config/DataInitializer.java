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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
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
    private final AdmissionRepository admissionRepository;
    private final StudentSemesterFeeRepository studentSemesterFeeRepository;
    private final FeePaymentRequestRepository feePaymentRequestRepository;
    private final FeePaymentReceiptRepository feePaymentReceiptRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-email:admin@skmahavidyalaya.ac.in}")
    private String adminEmail;

    @Value("${app.admin.default-password:Admin@SKM2024}")
    private String adminPassword;

    @Value("${app.admin.default-name:System Administrator}")
    private String adminName;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking and seeding 100% full database records from SQL backup...");
        initRoles();
        initAdminUser();
        initDepartmentsAndCourses();
        initFeeStructures();
        initFaculty();
        initNotices();
        initGallery();
        initTestimonials();
        initEvents();
        initStudentsAndAdmissions();
        initSemesterFeesAndPayments();
        initContactMessages();
        log.info("Complete database seeding finished successfully.");
    }

    private void initRoles() {
        if (roleRepository.count() == 0) {
            roleRepository.save(Role.builder().name(AppConstants.ROLE_ADMIN).description("Full administrative access").build());
            roleRepository.save(Role.builder().name(AppConstants.ROLE_USER).description("Student / User portal access").build());
        }
    }

    private void initAdminUser() {
        if (!userRepository.existsByEmail(adminEmail)) {
            Role adminRole = roleRepository.findByName(AppConstants.ROLE_ADMIN)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(AppConstants.ROLE_ADMIN).description("Admin").build()));
            Role userRole = roleRepository.findByName(AppConstants.ROLE_USER)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(AppConstants.ROLE_USER).description("User").build()));

            User admin = User.builder()
                    .username("admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .firstName("System")
                    .lastName("Administrator")
                    .phone("9876543210")
                    .active(true)
                    .emailVerified(true)
                    .roles(new HashSet<>(Set.of(adminRole, userRole)))
                    .build();

            userRepository.save(admin);
            log.info("Admin user created: {}", adminEmail);
        }
    }

    private void initDepartmentsAndCourses() {
        if (departmentRepository.count() == 0) {
            Department arts = departmentRepository.save(Department.builder().name("Arts").code("ARTS").establishedYear(2008).active(true).displayOrder(1).build());
            Department science = departmentRepository.save(Department.builder().name("Science").code("SCI").establishedYear(2012).active(true).displayOrder(2).build());
            Department commerce = departmentRepository.save(Department.builder().name("Commerce").code("COMM").establishedYear(2012).active(true).displayOrder(3).build());
            Department cs = departmentRepository.save(Department.builder().name("Computer Science").code("CS").establishedYear(2016).active(true).displayOrder(4).build());
            Department edu = departmentRepository.save(Department.builder().name("Education").code("EDU").establishedYear(2018).active(true).displayOrder(5).build());

            if (courseRepository.count() == 0) {
                courseRepository.save(Course.builder()
                        .code("BA").name("Bachelor of Arts").shortName("B.A.")
                        .durationYears(3).totalSeats(240).eligibility("10+2 in any stream")
                        .tuitionFee(4500.0).otherFee(1200.0).department(arts)
                        .subjects(List.of("Hindi", "History", "Political Science", "Sociology", "Home Science"))
                        .active(true).displayOrder(1).build());

                courseRepository.save(Course.builder()
                        .code("BSC").name("Bachelor of Science").shortName("B.Sc.")
                        .durationYears(3).totalSeats(120).eligibility("10+2 with Science")
                        .tuitionFee(7800.0).otherFee(2400.0).department(science)
                        .subjects(List.of("Physics", "Chemistry", "Mathematics", "Zoology", "Botany"))
                        .active(true).displayOrder(2).build());

                courseRepository.save(Course.builder()
                        .code("BCOM").name("Bachelor of Commerce").shortName("B.Com.")
                        .durationYears(3).totalSeats(160).eligibility("10+2 in any stream")
                        .tuitionFee(5200.0).otherFee(1200.0).department(commerce)
                        .subjects(List.of("Accountancy", "Business Studies", "Economics", "Taxation"))
                        .active(true).displayOrder(3).build());
            }
        }
    }

    private void initFeeStructures() {
        if (feeStructureRepository.count() == 0) {
            String[] sems = {"Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"};
            for (String sem : sems) {
                double baAcad = sem.equals("Semester 1") || sem.equals("Semester 2") ? 2000.0 : 5000.0;
                double bscAcad = sem.equals("Semester 1") || sem.equals("Semester 2") ? 4000.0 : 8000.0;

                feeStructureRepository.save(FeeStructure.builder()
                        .courseCode("BA").semester(sem)
                        .academicFee(baAcad).sportsFee(500.0).examFee(1000.0).otherFee(500.0)
                        .build());

                feeStructureRepository.save(FeeStructure.builder()
                        .courseCode("BSC").semester(sem)
                        .academicFee(bscAcad).sportsFee(500.0).examFee(1200.0).otherFee(800.0)
                        .build());
            }
        }
    }

    private void initFaculty() {
        if (facultyRepository.count() == 0) {
            List<Department> depts = departmentRepository.findByDeletedFalseAndActiveTrueOrderByDisplayOrder();
            Department arts = !depts.isEmpty() ? depts.get(0) : null;
            Department science = depts.size() > 1 ? depts.get(1) : null;

            facultyRepository.save(Faculty.builder()
                    .name("Dr. Ashok Tiwari").designation("Principal & Associate Professor")
                    .qualification("Ph.D. in Hindi")
                    .initials("AT").department(arts).experienceYears(20).active(true)
                    .photoUrl("/uploads/faculty,faculty/17c1db56-4f3a-4422-ac78-7fdba8268c02.png")
                    .displayOrder(1).build());

            facultyRepository.save(Faculty.builder()
                    .name("Dr. Meera Srivastava").designation("Head, Department of Science")
                    .qualification("Ph.D. in Physics")
                    .initials("MS").department(science).experienceYears(15).active(true)
                    .displayOrder(2).build());

            facultyRepository.save(Faculty.builder()
                    .name("Rajan Mishra").designation("Associate Prof")
                    .qualification("Phd in CSE")
                    .initials("RM").experienceYears(5).active(true)
                    .photoUrl("/uploads/faculty,faculty/745622be-b619-41c2-979d-35e3303eae0a.webp")
                    .displayOrder(3).build());
        }
    }

    private void initNotices() {
        if (noticeRepository.count() == 0) {
            noticeRepository.save(Notice.builder()
                    .title("UG admission form (Session 2026–27) submission window extended to Aug 10.")
                    .content("All candidates applying for UG courses (B.A., B.Sc., B.Com., BCA) can now submit forms up to August 10, 2026.")
                    .attachmentUrl("/uploads/notices,notices/c1fa7975-1347-4e72-9fc5-3c0430477add.webp")
                    .noticeDate(LocalDate.now()).tag("Admission").pinned(true).active(true)
                    .build());

            noticeRepository.save(Notice.builder()
                    .title("Odd-semester examination date-sheet released for all faculties.")
                    .content("The upcoming semester examination date-sheet has been published. Check details on notice board.")
                    .noticeDate(LocalDate.now().minusDays(5)).tag("Exam").pinned(false).active(true)
                    .build());

            noticeRepository.save(Notice.builder()
                    .title("Collage Close Tommorw")
                    .content("Tommorow cllg will close due to prediction of heavy rain.")
                    .noticeDate(LocalDate.now()).tag("Holiday").pinned(true).active(true)
                    .build());

            noticeRepository.save(Notice.builder()
                    .title("Independence Day 15th Aug")
                    .content("Every student is invited for independence day function.")
                    .attachmentUrl("/uploads/notices,notices/0961f4bc-9068-4a2e-9024-f853e8070fa4.pdf")
                    .noticeDate(LocalDate.now()).tag("Function").pinned(false).active(true)
                    .build());
        }
    }

    private void initGallery() {
        if (galleryRepository.count() == 0) {
            galleryRepository.save(GalleryItem.builder().caption("Main Campus Building").tag("Campus")
                    .imageUrl("/uploads/campus.jpg").active(true).displayOrder(1).build());
            galleryRepository.save(GalleryItem.builder().caption("Annual Sports Meet").tag("Sports")
                    .imageUrl("/uploads/sports.jpg").active(true).displayOrder(2).build());
            galleryRepository.save(GalleryItem.builder().caption("Annual Sports meets").tag("Sports")
                    .imageUrl("/uploads/gallery,gallery/fc77b9d2-9414-4989-8337-4a1505526650.png").active(true).displayOrder(3).build());
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
                    .active(true).featured(true).build());
        }
    }

    private void initStudentsAndAdmissions() {
        Role userRole = roleRepository.findByName(AppConstants.ROLE_USER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(AppConstants.ROLE_USER).description("User").build()));
        Course ba = courseRepository.findByCode("BA").orElse(null);
        Course bsc = courseRepository.findByCode("BSC").orElse(null);

        // 1. User 4: pranavmishra519@gmail.com
        if (!userRepository.existsByEmail("pranavmishra519@gmail.com")) {
            userRepository.save(User.builder()
                    .username("pranv18").email("pranavmishra519@gmail.com")
                    .password(passwordEncoder.encode("Pranav@123"))
                    .firstName("Pranav").lastName("mishra").phone("6393417529")
                    .active(true).emailVerified(true)
                    .roles(new HashSet<>(Set.of(userRole))).build());
        }

        // 2. User 11: pranavmishra5@gmail.com (BA577225)
        if (!userRepository.existsByEmail("pranavmishra5@gmail.com")) {
            User u11 = userRepository.save(User.builder()
                    .username("BA577225").email("pranavmishra5@gmail.com")
                    .password(passwordEncoder.encode("Pranav@123"))
                    .firstName("Pranav").lastName("mishra").phone("6393417529")
                    .address("chaitanya boys hostel,shivbagh colony ,ameerpet")
                    .studentId("BA577225").courseName("Bachelor of Arts (B.A.)")
                    .totalFee(12000.0).paidFee(2000.0).remainingFee(10000.0)
                    .active(true).emailVerified(true)
                    .roles(new HashSet<>(Set.of(userRole))).build());
            if (ba != null) {
                admissionRepository.save(Admission.builder().applicationNumber("SKM-BA-2026-00001").course(ba).user(u11).status("APPROVED").sessionYear("2026-2027").build());
            }
        }

        // 3. User 12: pranavmishra59@gmail.com (BA488842)
        if (!userRepository.existsByEmail("pranavmishra59@gmail.com")) {
            User u12 = userRepository.save(User.builder()
                    .username("BA488842").email("pranavmishra59@gmail.com")
                    .password(passwordEncoder.encode("Pranav@123"))
                    .firstName("Pranav").lastName("Mishra").phone("6393417529")
                    .address("saraswati boys hostel,IET campus ,ayodhya")
                    .studentId("BA488842").courseName("Bachelor of Arts (B.A.)")
                    .totalFee(12000.0).paidFee(0.0).remainingFee(12000.0)
                    .active(true).emailVerified(true)
                    .roles(new HashSet<>(Set.of(userRole))).build());
            if (ba != null) {
                admissionRepository.save(Admission.builder().applicationNumber("SKM-BA-2026-00002").course(ba).user(u12).status("APPROVED").sessionYear("2026-2027").build());
            }
        }

        // 4. User 13: pramishra519@gmail.com (BSC641212)
        if (!userRepository.existsByEmail("pramishra519@gmail.com")) {
            User u13 = userRepository.save(User.builder()
                    .username("BSC641212").email("pramishra519@gmail.com")
                    .password(passwordEncoder.encode("Pranav@123"))
                    .firstName("Pranav").lastName("mishra").phone("94547166393")
                    .address("Barua Uttari Lambhua Sultanpur")
                    .studentId("BSC641212").courseName("Bachelor of Science (B.Sc.)")
                    .totalFee(16000.0).paidFee(0.0).remainingFee(16000.0)
                    .active(true).emailVerified(true)
                    .roles(new HashSet<>(Set.of(userRole))).build());
            if (bsc != null) {
                admissionRepository.save(Admission.builder().applicationNumber("SKM-BSC-2026-00003").course(bsc).user(u13).status("APPROVED").sessionYear("2026-2027").build());
            }
        }

        // 5. User 14: pranavmi2@gmail.com (BA255557)
        if (!userRepository.existsByEmail("pranavmi2@gmail.com")) {
            User u14 = userRepository.save(User.builder()
                    .username("BA255557").email("pranavmi2@gmail.com")
                    .password(passwordEncoder.encode("Pranav@123"))
                    .firstName("Pranav").lastName("mishra").phone("6393417529")
                    .address("saraswati boys hostel,IET campus ,ayodhya")
                    .studentId("BA255557").courseName("Bachelor of Arts (B.A.)")
                    .totalFee(12000.0).paidFee(12000.0).remainingFee(0.0)
                    .active(true).emailVerified(true)
                    .roles(new HashSet<>(Set.of(userRole))).build());
            if (ba != null) {
                admissionRepository.save(Admission.builder().applicationNumber("SKM-BA-2026-00004").course(ba).user(u14).status("APPROVED").sessionYear("2026-2027").build());
            }
        }

        // 6. User 15: pranavmishra98@gmail.com (BSC696071)
        if (!userRepository.existsByEmail("pranavmishra98@gmail.com")) {
            User u15 = userRepository.save(User.builder()
                    .username("BSC696071").email("pranavmishra98@gmail.com")
                    .password(passwordEncoder.encode("Pranav@123"))
                    .firstName("Pranav").lastName("mishra").phone("6393417529")
                    .address("Barua Uttari Lambhua Sultanpur")
                    .studentId("BSC696071").courseName("BSC")
                    .currentSemester("Semester 2")
                    .totalFee(21000.0).paidFee(10500.0).remainingFee(10500.0)
                    .active(true).emailVerified(true)
                    .roles(new HashSet<>(Set.of(userRole))).build());
            if (bsc != null) {
                admissionRepository.save(Admission.builder().applicationNumber("SKM-BSC-2026-00005").course(bsc).user(u15).status("APPROVED").sessionYear("2026-2027").build());
            }
        }

        // 7. User 16: anjali234@gmail.com (BA442226)
        if (!userRepository.existsByEmail("anjali234@gmail.com")) {
            User u16 = userRepository.save(User.builder()
                    .username("BA442226").email("anjali234@gmail.com")
                    .password(passwordEncoder.encode("Anjali@123"))
                    .firstName("Anjali").lastName("verma").phone("6352635214")
                    .address("chaitanya boys hostel,shivbagh colony ,ameerpet")
                    .studentId("BA442226").courseName("BA")
                    .currentSemester("Semester 3")
                    .totalFee(21000.0).paidFee(14000.0).remainingFee(7000.0)
                    .active(true).emailVerified(true)
                    .roles(new HashSet<>(Set.of(userRole))).build());
            if (ba != null) {
                admissionRepository.save(Admission.builder().applicationNumber("SKM-BA-2026-00006").course(ba).user(u16).status("APPROVED").sessionYear("2026-2027").build());
            }
        }

        // 8. User 17: bfdjbj@gmail.com (BSC217481)
        if (!userRepository.existsByEmail("bfdjbj@gmail.com")) {
            User u17 = userRepository.save(User.builder()
                    .username("BSC217481").email("bfdjbj@gmail.com")
                    .password(passwordEncoder.encode("Raja@123"))
                    .firstName("Raja").lastName("Saanb").phone("562314588")
                    .address("Pratapgarh")
                    .studentId("BSC217481").courseName("BSC")
                    .currentSemester("Semester 1")
                    .totalFee(6500.0).paidFee(4000.0).remainingFee(2500.0)
                    .active(true).emailVerified(true)
                    .roles(new HashSet<>(Set.of(userRole))).build());
            if (bsc != null) {
                admissionRepository.save(Admission.builder().applicationNumber("SKM-BSC-2026-00007").course(bsc).user(u17).status("APPROVED").sessionYear("2026-2027").build());
            }
        }
    }

    private void initSemesterFeesAndPayments() {
        User u15 = userRepository.findByEmailAndDeletedFalse("pranavmishra98@gmail.com").orElse(null);
        User u16 = userRepository.findByEmailAndDeletedFalse("anjali234@gmail.com").orElse(null);
        User u17 = userRepository.findByEmailAndDeletedFalse("bfdjbj@gmail.com").orElse(null);

        if (u16 != null && studentSemesterFeeRepository.findByUserOrderBySemesterAsc(u16).isEmpty()) {
            StudentSemesterFee ssf1 = studentSemesterFeeRepository.save(StudentSemesterFee.builder()
                    .user(u16).courseCode("BA").semester("Semester 1")
                    .academicFee(5000.0).sportsFee(500.0).examFee(1000.0).otherFee(500.0)
                    .academicPaid(true).sportsPaid(true).examPaid(true).otherPaid(true)
                    .status("PAID").build());

            StudentSemesterFee ssf2 = studentSemesterFeeRepository.save(StudentSemesterFee.builder()
                    .user(u16).courseCode("BA").semester("Semester 2")
                    .academicFee(5000.0).sportsFee(500.0).examFee(1000.0).otherFee(500.0)
                    .academicPaid(true).sportsPaid(true).examPaid(true).otherPaid(true)
                    .status("PAID").build());

            studentSemesterFeeRepository.save(StudentSemesterFee.builder()
                    .user(u16).courseCode("BA").semester("Semester 3")
                    .academicFee(5000.0).sportsFee(500.0).examFee(1000.0).otherFee(500.0)
                    .academicPaid(false).sportsPaid(false).examPaid(false).otherPaid(false)
                    .status("PENDING").build());

            feePaymentReceiptRepository.save(FeePaymentReceipt.builder()
                    .user(u16).studentSemesterFee(ssf1).receiptNumber("REC-20260806-9903")
                    .semester("Semester 1").courseCode("BA").academicAmount(5000.0).sportsAmount(0.0).examAmount(1000.0).otherAmount(500.0).totalPaid(6500.0)
                    .feeTypesPaid("Academic Fee, Exam Fee, Other Fee").paymentStatus("PAID").paymentDate(LocalDateTime.now().minusDays(10)).build());

            feePaymentReceiptRepository.save(FeePaymentReceipt.builder()
                    .user(u16).studentSemesterFee(ssf1).receiptNumber("REC-20260806-9751")
                    .semester("Semester 1").courseCode("BA").academicAmount(0.0).sportsAmount(500.0).examAmount(0.0).otherAmount(0.0).totalPaid(500.0)
                    .feeTypesPaid("Sports Fee").paymentStatus("PAID").paymentDate(LocalDateTime.now().minusDays(10)).build());

            feePaymentReceiptRepository.save(FeePaymentReceipt.builder()
                    .user(u16).studentSemesterFee(ssf2).receiptNumber("REC-20260806-5030")
                    .semester("Semester 2").courseCode("BA").academicAmount(5000.0).sportsAmount(500.0).examAmount(1000.0).otherAmount(500.0).totalPaid(7000.0)
                    .feeTypesPaid("Academic Fee, Sports Fee, Exam Fee, Other Fee").paymentStatus("PAID").paymentDate(LocalDateTime.now().minusDays(10)).build());
        }

        if (u15 != null && studentSemesterFeeRepository.findByUserOrderBySemesterAsc(u15).isEmpty()) {
            StudentSemesterFee ssf3 = studentSemesterFeeRepository.save(StudentSemesterFee.builder()
                    .user(u15).courseCode("BSC").semester("Semester 1")
                    .academicFee(8000.0).sportsFee(500.0).examFee(1200.0).otherFee(800.0)
                    .academicPaid(true).sportsPaid(true).examPaid(true).otherPaid(true)
                    .status("PAID").build());

            studentSemesterFeeRepository.save(StudentSemesterFee.builder()
                    .user(u15).courseCode("BSC").semester("Semester 2")
                    .academicFee(8000.0).sportsFee(500.0).examFee(1200.0).otherFee(800.0)
                    .academicPaid(false).sportsPaid(false).examPaid(false).otherPaid(false)
                    .status("PENDING").build());

            feePaymentReceiptRepository.save(FeePaymentReceipt.builder()
                    .user(u15).studentSemesterFee(ssf3).receiptNumber("REC-20260806-1775")
                    .semester("Semester 1").courseCode("BSC").academicAmount(8000.0).sportsAmount(500.0).examAmount(1200.0).otherAmount(800.0).totalPaid(10500.0)
                    .feeTypesPaid("Academic Fee, Sports Fee, Exam Fee, Other Fee").paymentStatus("PAID").paymentDate(LocalDateTime.now().minusDays(10)).build());
        }

        if (u17 != null && studentSemesterFeeRepository.findByUserOrderBySemesterAsc(u17).isEmpty()) {
            StudentSemesterFee ssf6 = studentSemesterFeeRepository.save(StudentSemesterFee.builder()
                    .user(u17).courseCode("BSC").semester("Semester 1")
                    .academicFee(4000.0).sportsFee(500.0).examFee(1200.0).otherFee(800.0)
                    .academicPaid(true).sportsPaid(false).examPaid(false).otherPaid(false)
                    .status("PARTIAL").build());

            feePaymentReceiptRepository.save(FeePaymentReceipt.builder()
                    .user(u17).studentSemesterFee(ssf6).receiptNumber("REC-20260807-9340")
                    .semester("Semester 1").courseCode("BSC").academicAmount(4000.0).sportsAmount(0.0).examAmount(0.0).otherAmount(0.0).totalPaid(4000.0)
                    .feeTypesPaid("Academic Fee").paymentStatus("PAID").paymentDate(LocalDateTime.now().minusDays(9)).build());
        }
    }

    private void initContactMessages() {
        if (contactMessageRepository.count() == 0) {
            contactMessageRepository.save(ContactMessage.builder()
                    .fullName("Pranav mishra")
                    .email("pranavmishra519@gmail.com")
                    .phone("6393417529")
                    .subject("Fee Structure")
                    .message("Hi this is for testing")
                    .status("REPLIED")
                    .reply("Dear Pranav mishra,\n\nThank you for your inquiry about fee structure and courses. Please check our website Courses section or contact the office at 05342-240100 for current session details.\n\nBest regards,\nSKM College Office")
                    .repliedBy("admin")
                    .build());
        }
    }
}
