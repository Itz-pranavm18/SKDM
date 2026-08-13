package com.skm.service.impl;

import com.skm.constants.AppConstants;
import com.skm.dto.AdmissionDto;
import com.skm.dto.FeePaymentDto;
import com.skm.dto.StudentFeeOverviewDto;
import com.skm.entity.*;
import com.skm.exception.BadRequestException;
import com.skm.exception.DuplicateResourceException;
import com.skm.exception.ResourceNotFoundException;
import com.skm.mail.EmailService;
import com.skm.repository.*;
import com.skm.request.AdmissionRequest;
import com.skm.request.FeePaymentSubmissionRequest;
import com.skm.request.NewAdmissionRequest;
import com.skm.response.ApiResponse;
import com.skm.response.PagedResponse;
import com.skm.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdmissionService {

    private final AdmissionRepository admissionRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final FeePaymentRequestRepository feePaymentRequestRepository;
    private final StudentSemesterFeeRepository studentSemesterFeeRepository;
    private final FeePaymentReceiptRepository feePaymentReceiptRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ActivityLogService activityLogService;
    private final FeeManagementService feeManagementService;

    // ── Admin: Create New Student Admission ───────────────────────────────────
    public ApiResponse<Map<String, Object>> createStudentAdmission(NewAdmissionRequest request) {
        // Enforce BA & BSC course restriction
        String prefix = extractCoursePrefix(request.getCourseCode(), request.getCourseName());
        if (!"BA".equalsIgnoreCase(prefix) && !"BSC".equalsIgnoreCase(prefix)) {
            throw new BadRequestException("Admission is only allowed for BA and BSC courses.");
        }
        String normalizedCourse = prefix.toUpperCase();

        String semester = (request.getSemester() != null && !request.getSemester().isBlank())
                ? request.getSemester().trim()
                : "Semester 1";

        String studentId = generateUniqueStudentId(normalizedCourse);

        // Name parsing
        String name = request.getName().trim();
        String firstName = name;
        String lastName = "";
        if (name.contains(" ")) {
            int idx = name.indexOf(" ");
            firstName = name.substring(0, idx);
            lastName = name.substring(idx + 1).trim();
        }

        // Email setup
        String email = request.getEmail();
        if (email != null && !email.isBlank()) {
            String trimmedEmail = email.trim();
            if (userRepository.existsByEmail(trimmedEmail)) {
                throw new DuplicateResourceException("An account with email '" + trimmedEmail + "' already exists. Please use a different email or leave it blank.");
            }
            email = trimmedEmail;
        } else {
            email = studentId.toLowerCase() + "@skm.local";
        }

        // Password defaults to DOB
        String rawPassword = request.getDob().trim();
        String encodedPassword = passwordEncoder.encode(rawPassword);

        // Fetch User role
        Role userRole = roleRepository.findByName(AppConstants.ROLE_USER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(AppConstants.ROLE_USER).description("Student / User Role").build()));

        // Create User
        User studentUser = User.builder()
                .username(studentId)
                .studentId(studentId)
                .email(email)
                .password(encodedPassword)
                .firstName(firstName)
                .lastName(lastName)
                .phone(request.getMobileNumber())
                .dateOfBirth(parseLocalDate(request.getDob()))
                .address(request.getAddress())
                .courseName(normalizedCourse)
                .currentSemester(semester)
                .totalFee(0.0)
                .paidFee(0.0)
                .remainingFee(0.0)
                .roles(new HashSet<>(Set.of(userRole)))
                .active(true)
                .emailVerified(true)
                .build();

        userRepository.save(studentUser);

        // Initialize Semester Fee Record for the admitted student
        feeManagementService.initializeStudentSemesterFee(studentUser, normalizedCourse, semester);

        // Create Admission entity record
        String appNum = "SKM-" + normalizedCourse + "-" + LocalDate.now().getYear() + "-" + String.format("%05d", admissionRepository.count() + 1);
        Course course = courseRepository.findByCode(normalizedCourse).orElse(null);

        Admission admission = Admission.builder()
                .applicationNumber(appNum)
                .user(studentUser)
                .course(course)
                .sessionYear(LocalDate.now().getYear() + "-" + (LocalDate.now().getYear() + 1))
                .status(AppConstants.ADMISSION_APPROVED)
                .feePaid(false)
                .build();

        admissionRepository.save(admission);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("studentId", studentId);
        result.put("username", studentId);
        result.put("password", rawPassword);
        result.put("name", name);
        result.put("courseName", normalizedCourse);
        result.put("semester", semester);
        result.put("totalFee", studentUser.getTotalFee());

        log.info("Admitted new student: {} with ID: {} into {} {}", name, studentId, normalizedCourse, semester);
        return ApiResponse.created(result, "Student admitted successfully into " + normalizedCourse + " (" + semester + "). Login Credentials generated.");
    }

    // ── Student: Submit Fee Payment Request ────────────────────────────────────
    public ApiResponse<FeePaymentDto> submitFeePaymentRequest(Long userId, FeePaymentSubmissionRequest request) {
        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        StudentSemesterFee ssf = null;
        String semester = request.getSemester() != null ? request.getSemester() : user.getCurrentSemester();
        double totalAmount = request.getAmount() != null ? request.getAmount() : 0.0;
        double academicAmt = 0.0;
        double sportsAmt = 0.0;
        double examAmt = 0.0;
        double otherAmt = 0.0;
        List<String> feeTypesList = new ArrayList<>();

        if (request.getSemesterFeeId() != null) {
            ssf = studentSemesterFeeRepository.findById(request.getSemesterFeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("StudentSemesterFee", "id", request.getSemesterFeeId()));

            semester = ssf.getSemester();

            // 1. Pending fee rule check for prior semesters
            List<StudentSemesterFee> allFees = studentSemesterFeeRepository.findByUserOrderBySemesterAsc(user);
            int targetSemIndex = getSemesterIndex(ssf.getSemester());
            for (StudentSemesterFee prior : allFees) {
                int priorIndex = getSemesterIndex(prior.getSemester());
                if (priorIndex < targetSemIndex && !"PAID".equalsIgnoreCase(prior.getStatus())) {
                    throw new BadRequestException("Please clear all pending fees of " + prior.getSemester() + " before paying " + ssf.getSemester() + " fees.");
                }
            }

            // 2. Itemized Fee Calculations
            if (!request.isPayAcademic() && !request.isPaySports() && !request.isPayExam() && !request.isPayOther()) {
                throw new BadRequestException("Please select at least one fee type to pay.");
            }

            if (request.isPayAcademic()) {
                if (ssf.isAcademicPaid()) {
                    throw new BadRequestException("Academic Fee for " + ssf.getSemester() + " is already paid.");
                }
                academicAmt = ssf.getAcademicFee();
                feeTypesList.add("Academic Fee");
            }

            if (request.isPaySports()) {
                if (ssf.isSportsPaid()) {
                    throw new BadRequestException("Sports Fee for " + ssf.getSemester() + " is already paid.");
                }
                sportsAmt = ssf.getSportsFee();
                feeTypesList.add("Sports Fee");
            }

            if (request.isPayExam()) {
                if (ssf.isExamPaid()) {
                    throw new BadRequestException("Exam Fee for " + ssf.getSemester() + " is already paid.");
                }
                examAmt = ssf.getExamFee();
                feeTypesList.add("Exam Fee");
            }

            if (request.isPayOther()) {
                if (ssf.isOtherPaid()) {
                    throw new BadRequestException("Other Fee for " + ssf.getSemester() + " is already paid.");
                }
                otherAmt = ssf.getOtherFee();
                feeTypesList.add("Other Fee");
            }

            totalAmount = academicAmt + sportsAmt + examAmt + otherAmt;
        }

        String feeTypesStr = feeTypesList.isEmpty() ? "Course Fee" : String.join(", ", feeTypesList);

        FeePaymentRequest req = FeePaymentRequest.builder()
                .user(user)
                .studentSemesterFee(ssf)
                .studentId(user.getStudentId() != null ? user.getStudentId() : user.getUsername())
                .studentName(user.getFullName())
                .courseName(user.getCourseName())
                .semester(semester)
                .feeTypesPaid(feeTypesStr)
                .payAcademic(request.isPayAcademic())
                .paySports(request.isPaySports())
                .payExam(request.isPayExam())
                .payOther(request.isPayOther())
                .academicAmount(academicAmt)
                .sportsAmount(sportsAmt)
                .examAmount(examAmt)
                .otherAmount(otherAmt)
                .amount(totalAmount)
                .paymentDate(parseLocalDate(request.getPaymentDate()))
                .utrNumber(request.getUtrNumber())
                .transactionNumber(request.getTransactionNumber())
                .screenshotUrl(request.getScreenshotUrl())
                .remarks(request.getRemarks())
                .status("PENDING")
                .build();

        feePaymentRequestRepository.save(req);

        return ApiResponse.created(mapFeePaymentToDto(req), "Payment verification request submitted successfully. Waiting for Admin verification.");
    }

    // ── Student / User: Get Fee & Details Overview ─────────────────────────────
    @Transactional(readOnly = true)
    public ApiResponse<StudentFeeOverviewDto> getStudentFeeDetails(Long userId) {
        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<FeePaymentDto> requests = new ArrayList<>();
        try {
            List<FeePaymentRequest> rawRequests = feePaymentRequestRepository
                    .findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId);
            if (rawRequests != null) {
                for (FeePaymentRequest r : rawRequests) {
                    requests.add(mapFeePaymentToDto(r));
                }
            }
        } catch (Exception e) {
            log.error("Failed to load fee payment requests for user ID {}: {}", userId, e.getMessage());
        }

        StudentFeeOverviewDto dto = StudentFeeOverviewDto.builder()
                .userId(user.getId())
                .studentId(user.getStudentId() != null ? user.getStudentId() : user.getUsername())
                .name(user.getFullName())
                .dob(user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : "")
                .address(user.getAddress())
                .mobileNumber(user.getPhone())
                .email(user.getEmail())
                .courseName(user.getCourseName() != null ? user.getCourseName() : "BA")
                .totalFee(user.getTotalFee() != null ? user.getTotalFee() : 0.0)
                .paidFee(user.getPaidFee() != null ? user.getPaidFee() : 0.0)
                .remainingFee(user.getRemainingFee() != null ? user.getRemainingFee() : 0.0)
                .paymentRequests(requests)
                .build();

        return ApiResponse.success(dto, "Student fee details retrieved successfully");
    }

    // ── Admin: List Pending Fee Verifications ──────────────────────────────────
    @Transactional(readOnly = true)
    public ApiResponse<List<FeePaymentDto>> getPendingFeeVerifications() {
        List<FeePaymentDto> list = feePaymentRequestRepository
                .findByStatusAndDeletedFalseOrderByCreatedAtDesc("PENDING")
                .stream().map(this::mapFeePaymentToDto).collect(Collectors.toList());
        return ApiResponse.success(list, "Pending fee verifications retrieved");
    }

    // ── Admin: Confirm / Verify Fee Payment ────────────────────────────────────
    @Transactional
    public ApiResponse<FeePaymentDto> verifyFeePayment(Long requestId, User admin) {
        FeePaymentRequest req = feePaymentRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("FeePaymentRequest", "id", requestId));

        if (!"PENDING".equals(req.getStatus())) {
            throw new BadRequestException("This payment request is already " + req.getStatus());
        }

        User student = req.getUser();
        StudentSemesterFee ssf = req.getStudentSemesterFee();

        String semName = req.getSemester() != null ? req.getSemester() : "Semester 1";
        String courseCode = extractCoursePrefix((student != null && student.getCourseName() != null) ? student.getCourseName() : "BA");

        if (ssf == null && student != null) {
            ssf = feeManagementService.initializeStudentSemesterFee(student, courseCode, semName);
            req.setStudentSemesterFee(ssf);
        }

        if (ssf != null) {
            if (Boolean.TRUE.equals(req.getPayAcademic())) ssf.setAcademicPaid(true);
            if (Boolean.TRUE.equals(req.getPaySports())) ssf.setSportsPaid(true);
            if (Boolean.TRUE.equals(req.getPayExam())) ssf.setExamPaid(true);
            if (Boolean.TRUE.equals(req.getPayOther())) ssf.setOtherPaid(true);

            ssf.recalculateStatus();
            studentSemesterFeeRepository.save(ssf);
        }

        String receiptNumber = generateReceiptNumber();
        FeePaymentReceipt receipt = FeePaymentReceipt.builder()
                .receiptNumber(receiptNumber)
                .user(student)
                .studentSemesterFee(ssf)
                .courseCode(courseCode)
                .semester(semName)
                .feeTypesPaid(req.getFeeTypesPaid() != null ? req.getFeeTypesPaid() : "Course Fee")
                .academicAmount(req.getAcademicAmount() != null ? req.getAcademicAmount() : 0.0)
                .sportsAmount(req.getSportsAmount() != null ? req.getSportsAmount() : 0.0)
                .examAmount(req.getExamAmount() != null ? req.getExamAmount() : 0.0)
                .otherAmount(req.getOtherAmount() != null ? req.getOtherAmount() : 0.0)
                .totalPaid(req.getAmount() != null ? req.getAmount() : 0.0)
                .paymentDate(LocalDateTime.now())
                .paymentStatus("PAID")
                .build();

        feePaymentReceiptRepository.save(receipt);

        req.setStatus("VERIFIED");
        req.setReceiptNumber(receiptNumber);
        req.setVerifiedAt(LocalDateTime.now());
        req.setVerifiedBy(admin != null ? admin.getUsername() : "ADMIN");
        feePaymentRequestRepository.save(req);

        if (student != null) {
            recalculateUserFees(student);
        }

        return ApiResponse.success(mapFeePaymentToDto(req), "Payment verified successfully. Official fee receipt generated!");
    }

    // ── Admin: Reject Fee Payment ──────────────────────────────────────────────
    @Transactional
    public ApiResponse<FeePaymentDto> rejectFeePayment(Long requestId, String reason, User admin) {
        FeePaymentRequest req = feePaymentRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("FeePaymentRequest", "id", requestId));

        if (!"PENDING".equals(req.getStatus())) {
            throw new BadRequestException("This payment request is already " + req.getStatus());
        }

        req.setStatus("REJECTED");
        req.setRejectionReason(reason != null ? reason : "Payment transaction details could not be verified.");
        req.setVerifiedAt(LocalDateTime.now());
        req.setVerifiedBy(admin != null ? admin.getUsername() : "ADMIN");
        feePaymentRequestRepository.save(req);

        return ApiResponse.success(mapFeePaymentToDto(req), "Payment request rejected.");
    }

    private int getSemesterIndex(String semester) {
        List<String> sems = List.of("Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6");
        int idx = sems.indexOf(semester);
        return idx >= 0 ? idx : 0;
    }

    private void recalculateUserFees(User user) {
        List<StudentSemesterFee> fees = studentSemesterFeeRepository.findByUserOrderBySemesterAsc(user);
        double total = fees.stream().mapToDouble(StudentSemesterFee::getTotalFee).sum();
        double paid = fees.stream().mapToDouble(StudentSemesterFee::getPaidFee).sum();
        double remaining = Math.max(0.0, total - paid);

        user.setTotalFee(total);
        user.setPaidFee(paid);
        user.setRemainingFee(remaining);
        userRepository.save(user);
    }

    private String generateReceiptNumber() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomNum = 1000 + new Random().nextInt(9000);
        return "REC-" + dateStr + "-" + randomNum;
    }

    // ── Admin: Fee Collection Summary ──────────────────────────────────────────
    @Transactional(readOnly = true)
    public ApiResponse<Map<String, Object>> getFeeCollectionSummary() {
        List<User> students = userRepository.findAll().stream()
                .filter(u -> !u.isDeleted() && u.getStudentId() != null)
                .collect(Collectors.toList());

        double totalFees = students.stream().mapToDouble(u -> u.getTotalFee() != null ? u.getTotalFee() : 0.0).sum();
        double totalCollectedFees = students.stream().mapToDouble(u -> u.getPaidFee() != null ? u.getPaidFee() : 0.0).sum();
        double remainingFees = Math.max(0.0, totalFees - totalCollectedFees);

        List<Map<String, Object>> studentList = students.stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("userId", u.getId());
            m.put("studentId", u.getStudentId() != null ? u.getStudentId() : u.getUsername());
            m.put("name", u.getFullName());
            m.put("dob", u.getDateOfBirth() != null ? u.getDateOfBirth().toString() : "");
            m.put("address", u.getAddress() != null ? u.getAddress() : "");
            m.put("courseName", u.getCourseName() != null ? u.getCourseName() : "BA");
            m.put("currentSemester", u.getCurrentSemester() != null ? u.getCurrentSemester() : "Semester 1");
            m.put("mobileNumber", u.getPhone() != null ? u.getPhone() : "");
            m.put("email", u.getEmail() != null ? u.getEmail() : "");
            m.put("totalFee", u.getTotalFee() != null ? u.getTotalFee() : 0.0);
            m.put("paidFee", u.getPaidFee() != null ? u.getPaidFee() : 0.0);
            m.put("remainingFee", u.getRemainingFee() != null ? u.getRemainingFee() : 0.0);
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalFees", totalFees);
        summary.put("totalCollectedFees", totalCollectedFees);
        summary.put("remainingFees", remainingFees);
        summary.put("totalStudents", students.size());
        summary.put("students", studentList);

        return ApiResponse.success(summary, "Fee collection summary retrieved");
    }

    // ── Admin: Edit Student Record ─────────────────────────────────────────────
    @Transactional
    public ApiResponse<Map<String, Object>> updateStudentDetails(Long userId, NewAdmissionRequest request) {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Name parsing
        String name = request.getName().trim();
        String firstName = name;
        String lastName = "";
        if (name.contains(" ")) {
            int idx = name.indexOf(" ");
            firstName = name.substring(0, idx);
            lastName = name.substring(idx + 1).trim();
        }
        student.setFirstName(firstName);
        student.setLastName(lastName);

        // Date of Birth
        if (request.getDob() != null && !request.getDob().isBlank()) {
            student.setDateOfBirth(parseLocalDate(request.getDob()));
        }

        // Contact info
        student.setAddress(request.getAddress());
        student.setPhone(request.getMobileNumber());

        // Email check
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String trimmedEmail = request.getEmail().trim();
            if (!trimmedEmail.equalsIgnoreCase(student.getEmail()) && userRepository.existsByEmail(trimmedEmail)) {
                throw new DuplicateResourceException("An account with email '" + trimmedEmail + "' already exists.");
            }
            student.setEmail(trimmedEmail);
        }

        // Course & Fees
        student.setCourseName(request.getCourseName());
        double totalFee = request.getTotalCourseFee() != null ? request.getTotalCourseFee() : 0.0;
        double paidFee = student.getPaidFee() != null ? student.getPaidFee() : 0.0;
        double remainingFee = Math.max(0.0, totalFee - paidFee);

        student.setTotalFee(totalFee);
        student.setRemainingFee(remainingFee);

        userRepository.save(student);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("userId", student.getId());
        m.put("studentId", student.getStudentId());
        m.put("name", student.getFullName());
        m.put("dob", student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : "");
        m.put("address", student.getAddress());
        m.put("mobileNumber", student.getPhone());
        m.put("email", student.getEmail());
        m.put("courseName", student.getCourseName());
        m.put("totalFee", student.getTotalFee());
        m.put("paidFee", student.getPaidFee());
        m.put("remainingFee", student.getRemainingFee());

        return ApiResponse.success(m, "Student record updated successfully");
    }

    // ── Admin: Permanent Delete Student & Purge Related Data ───────────────────
    @Transactional
    public ApiResponse<Void> deleteStudentPermanently(Long userId) {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Purge related fee payment requests
        List<FeePaymentRequest> paymentRequests = feePaymentRequestRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId);
        if (!paymentRequests.isEmpty()) {
            feePaymentRequestRepository.deleteAll(paymentRequests);
        }

        // Purge related admission entities
        List<Admission> admissions = admissionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (!admissions.isEmpty()) {
            admissionRepository.deleteAll(admissions);
        }

        // Delete User entity permanently
        userRepository.delete(student);

        return ApiResponse.success(null, "Student record and all associated fee records deleted permanently");
    }

    // ── Original Admission Methods ─────────────────────────────────────────────
    public ApiResponse<AdmissionDto> applyForAdmission(AdmissionRequest request, Long userId) {
        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", request.getCourseId()));

        if (!course.isActive()) {
            throw new BadRequestException("This course is not accepting applications at this time");
        }

        if (admissionRepository.existsByUserIdAndCourseIdAndSessionYear(userId, course.getId(), request.getSessionYear())) {
            throw new BadRequestException("You have already applied for this course in session " + request.getSessionYear());
        }

        String applicationNumber = generateApplicationNumber(course.getCode(), request.getSessionYear());

        Admission admission = Admission.builder()
                .applicationNumber(applicationNumber)
                .user(user)
                .course(course)
                .sessionYear(request.getSessionYear())
                .status(AppConstants.ADMISSION_PENDING)
                .tenthPercentage(request.getTenthPercentage())
                .twelfthPercentage(request.getTwelfthPercentage())
                .graduationPercentage(request.getGraduationPercentage())
                .category(request.getCategory())
                .subCategory(request.getSubCategory())
                .documentUrls(request.getDocumentUrls() != null ? request.getDocumentUrls() : List.of())
                .photoUrl(request.getPhotoUrl())
                .feePaid(false)
                .build();

        admissionRepository.save(admission);
        activityLogService.log(user, AppConstants.ACTION_APPLY, "Applied for " + course.getName(), "Admission", String.valueOf(admission.getId()), null);

        return ApiResponse.created(mapToDto(admission), "Application submitted successfully. Application number: " + applicationNumber);
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<AdmissionDto>> getUserAdmissions(Long userId) {
        List<AdmissionDto> admissions = admissionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
        return ApiResponse.success(admissions, "Admissions retrieved successfully");
    }

    @Transactional(readOnly = true)
    public ApiResponse<AdmissionDto> getAdmissionById(Long id, Long userId, boolean isAdmin) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission", "id", id));

        if (!isAdmin && !admission.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to view this application");
        }
        return ApiResponse.success(mapToDto(admission), "Admission retrieved successfully");
    }

    @Transactional(readOnly = true)
    public ApiResponse<PagedResponse<AdmissionDto>> getAllAdmissions(String status, Long courseId,
                                                                      String sessionYear, String search,
                                                                      int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Admission> admissionsPage = admissionRepository.filterAdmissions(status, courseId, sessionYear, search, pageable);
        Page<AdmissionDto> dtoPage = admissionsPage.map(this::mapToDto);
        return ApiResponse.success(PagedResponse.of(dtoPage), "Admissions retrieved successfully");
    }

    public ApiResponse<AdmissionDto> approveAdmission(Long id, String remarks, User admin) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission", "id", id));

        if (!AppConstants.ADMISSION_PENDING.equals(admission.getStatus())) {
            throw new BadRequestException("Only PENDING admissions can be approved");
        }

        admission.setStatus(AppConstants.ADMISSION_APPROVED);
        admission.setRemarks(remarks);
        admission.setReviewedBy(admin.getFullName());
        admission.setReviewedAt(LocalDate.now());
        admissionRepository.save(admission);

        return ApiResponse.success(mapToDto(admission), "Admission approved successfully");
    }

    public ApiResponse<AdmissionDto> rejectAdmission(Long id, String reason, User admin) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission", "id", id));

        if (!AppConstants.ADMISSION_PENDING.equals(admission.getStatus())) {
            throw new BadRequestException("Only PENDING admissions can be rejected");
        }

        admission.setStatus(AppConstants.ADMISSION_REJECTED);
        admission.setRejectionReason(reason);
        admission.setReviewedBy(admin.getFullName());
        admission.setReviewedAt(LocalDate.now());
        admissionRepository.save(admission);

        return ApiResponse.success(mapToDto(admission), "Admission rejected");
    }

    // ── Helper methods ─────────────────────────────────────────────────────────
    private String extractCoursePrefix(String nameOrCode) {
        return extractCoursePrefix(nameOrCode, nameOrCode);
    }

    private String extractCoursePrefix(String courseCode, String courseName) {
        if (courseCode != null && !courseCode.isBlank()) {
            return courseCode.trim().toUpperCase().replaceAll("[^A-Z]", "");
        }
        if (courseName == null) return "STU";
        String lower = courseName.toLowerCase();
        if (lower.contains("b.a") || lower.contains("arts") || lower.contains("bachelor of arts")) return "BA";
        if (lower.contains("b.sc") || lower.contains("science") || lower.contains("bachelor of science")) return "BSC";
        if (lower.contains("b.com") || lower.contains("commerce") || lower.contains("bachelor of commerce")) return "BCOM";
        if (lower.contains("bca") || lower.contains("computer")) return "BCA";
        if (lower.contains("b.ed") || lower.contains("education")) return "BED";
        if (lower.contains("m.a") || lower.contains("master")) return "MA";

        String cleaned = courseName.toUpperCase().replaceAll("[^A-Z]", "");
        return cleaned.length() >= 3 ? cleaned.substring(0, 3) : "STU";
    }

    private String generateUniqueStudentId(String prefix) {
        Random random = new Random();
        String studentId;
        int attempts = 0;
        do {
            int randomNum = 1000 + random.nextInt(998999);
            studentId = prefix + String.format("%06d", randomNum);
            attempts++;
        } while (userRepository.existsByUsername(studentId) && attempts < 100);
        return studentId;
    }

    private LocalDate parseLocalDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return LocalDate.now();
        try {
            return LocalDate.parse(dateStr);
        } catch (Exception e) {
            try {
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            } catch (Exception ex) {
                return LocalDate.now();
            }
        }
    }

    private FeePaymentDto mapFeePaymentToDto(FeePaymentRequest r) {
        Long uId = null;
        try {
            if (r.getUser() != null) uId = r.getUser().getId();
        } catch (Exception e) {
            log.warn("Could not load user ID for FeePaymentRequest ID {}: {}", r.getId(), e.getMessage());
        }

        return FeePaymentDto.builder()
                .id(r.getId())
                .userId(uId)
                .studentId(r.getStudentId())
                .studentName(r.getStudentName())
                .courseName(r.getCourseName())
                .semester(r.getSemester())
                .feeTypesPaid(r.getFeeTypesPaid())
                .payAcademic(Boolean.TRUE.equals(r.getPayAcademic()))
                .paySports(Boolean.TRUE.equals(r.getPaySports()))
                .payExam(Boolean.TRUE.equals(r.getPayExam()))
                .payOther(Boolean.TRUE.equals(r.getPayOther()))
                .academicAmount(r.getAcademicAmount())
                .sportsAmount(r.getSportsAmount())
                .examAmount(r.getExamAmount())
                .otherAmount(r.getOtherAmount())
                .amount(r.getAmount())
                .paymentDate(r.getPaymentDate())
                .utrNumber(r.getUtrNumber())
                .transactionNumber(r.getTransactionNumber())
                .screenshotUrl(r.getScreenshotUrl())
                .remarks(r.getRemarks())
                .status(r.getStatus())
                .receiptNumber(r.getReceiptNumber())
                .rejectionReason(r.getRejectionReason())
                .createdAt(r.getCreatedAt())
                .verifiedAt(r.getVerifiedAt())
                .verifiedBy(r.getVerifiedBy())
                .build();
    }

    private String generateApplicationNumber(String courseCode, String sessionYear) {
        String yearPart = sessionYear.replace("-", "");
        String sequence = String.format("%05d", admissionRepository.count() + 1);
        return "SKM-" + courseCode + "-" + yearPart + "-" + sequence;
    }

    private AdmissionDto mapToDto(Admission a) {
        List<String> docs = new ArrayList<>();
        try {
            if (a.getDocumentUrls() != null) {
                docs = new ArrayList<>(a.getDocumentUrls());
            }
        } catch (Exception e) {
            log.warn("Could not lazily load documentUrls for admission ID {}: {}", a.getId(), e.getMessage());
        }

        return AdmissionDto.builder()
                .id(a.getId())
                .applicationNumber(a.getApplicationNumber())
                .userId(a.getUser() != null ? a.getUser().getId() : null)
                .userName(a.getUser() != null ? a.getUser().getFullName() : "")
                .userEmail(a.getUser() != null ? a.getUser().getEmail() : "")
                .courseId(a.getCourse() != null ? a.getCourse().getId() : null)
                .courseName(a.getCourse() != null ? a.getCourse().getName() : (a.getUser() != null ? a.getUser().getCourseName() : "General"))
                .courseCode(a.getCourse() != null ? a.getCourse().getCode() : "GEN")
                .sessionYear(a.getSessionYear())
                .status(a.getStatus())
                .remarks(a.getRemarks())
                .tenthPercentage(a.getTenthPercentage())
                .twelfthPercentage(a.getTwelfthPercentage())
                .graduationPercentage(a.getGraduationPercentage())
                .category(a.getCategory())
                .subCategory(a.getSubCategory())
                .documentUrls(docs)
                .photoUrl(a.getPhotoUrl())
                .reviewedBy(a.getReviewedBy())
                .reviewedAt(a.getReviewedAt())
                .rejectionReason(a.getRejectionReason())
                .feePaid(a.isFeePaid())
                .feeReceiptNumber(a.getFeeReceiptNumber())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
