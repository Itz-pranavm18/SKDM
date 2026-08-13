package com.skm.service.impl;

import com.skm.dto.*;
import com.skm.entity.*;
import com.skm.exception.BadRequestException;
import com.skm.exception.ResourceNotFoundException;
import com.skm.repository.*;
import com.skm.request.PayFeeRequest;
import com.skm.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeeManagementService {

    private final FeeStructureRepository feeStructureRepository;
    private final StudentSemesterFeeRepository studentSemesterFeeRepository;
    private final FeePaymentReceiptRepository feePaymentReceiptRepository;
    private final UserRepository userRepository;

    private static final List<String> SEMESTERS = List.of(
            "Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"
    );

    // ── Fee Structure Management (Admin) ──────────────────────────────────────────

    public List<FeeStructureDto> getAllFeeStructures() {
        return feeStructureRepository.findAllByOrderByCourseCodeAscSemesterAsc()
                .stream()
                .map(this::mapFeeStructureToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeeStructureDto updateFeeStructure(Long id, FeeStructureDto dto) {
        FeeStructure fs = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FeeStructure", "id", id));

        if (dto.getAcademicFee() != null && dto.getAcademicFee() >= 0) fs.setAcademicFee(dto.getAcademicFee());
        if (dto.getSportsFee() != null && dto.getSportsFee() >= 0) fs.setSportsFee(dto.getSportsFee());
        if (dto.getExamFee() != null && dto.getExamFee() >= 0) fs.setExamFee(dto.getExamFee());
        if (dto.getOtherFee() != null && dto.getOtherFee() >= 0) fs.setOtherFee(dto.getOtherFee());

        FeeStructure saved = feeStructureRepository.save(fs);
        return mapFeeStructureToDto(saved);
    }

    // ── Student Semester Fee Initialization ─────────────────────────────────────

    @Transactional
    public StudentSemesterFee initializeStudentSemesterFee(User student, String courseCode, String semester) {
        // Find existing or create new
        Optional<StudentSemesterFee> existing = studentSemesterFeeRepository.findByUserAndSemester(student, semester);
        if (existing.isPresent()) {
            return existing.get();
        }

        // Get template from FeeStructure
        FeeStructure fs = feeStructureRepository.findByCourseCodeAndSemester(courseCode, semester)
                .orElseGet(() -> {
                    // Fallback default structure
                    double academic = "BSC".equalsIgnoreCase(courseCode) ? 8000.0 : 5000.0;
                    double sports = 500.0;
                    double exam = "BSC".equalsIgnoreCase(courseCode) ? 1200.0 : 1000.0;
                    double other = "BSC".equalsIgnoreCase(courseCode) ? 800.0 : 500.0;
                    return feeStructureRepository.save(FeeStructure.builder()
                            .courseCode(courseCode)
                            .semester(semester)
                            .academicFee(academic)
                            .sportsFee(sports)
                            .examFee(exam)
                            .otherFee(other)
                            .build());
                });

        StudentSemesterFee ssf = StudentSemesterFee.builder()
                .user(student)
                .courseCode(courseCode)
                .semester(semester)
                .academicFee(fs.getAcademicFee())
                .sportsFee(fs.getSportsFee())
                .examFee(fs.getExamFee())
                .otherFee(fs.getOtherFee())
                .academicPaid(false)
                .sportsPaid(false)
                .examPaid(false)
                .otherPaid(false)
                .status("PENDING")
                .build();

        StudentSemesterFee saved = studentSemesterFeeRepository.save(ssf);
        recalculateUserFees(student);
        return saved;
    }

    // ── Student Fee Dashboard & History ─────────────────────────────────────────

    @Transactional
    public List<StudentSemesterFeeDto> getStudentFeeHistory(User studentPrincipal) {
        User student = userRepository.findById(studentPrincipal.getId())
                .orElse(studentPrincipal);

        String courseCode = extractCoursePrefix(student.getCourseName());
        String currentSem = student.getCurrentSemester();
        if (currentSem == null || currentSem.isBlank()) {
            currentSem = "Semester 1";
        }

        // Ensure fee records for all semesters up to current semester exist
        int currentSemIdx = getSemesterIndex(currentSem);
        for (int i = 0; i <= currentSemIdx; i++) {
            initializeStudentSemesterFee(student, courseCode, SEMESTERS.get(i));
        }

        List<StudentSemesterFee> feeRecords = studentSemesterFeeRepository.findByUserOrderBySemesterAsc(student);

        // Sort according to SEMESTERS list
        feeRecords.sort(Comparator.comparingInt(a -> getSemesterIndex(a.getSemester())));

        List<StudentSemesterFeeDto> dtos = new ArrayList<>();
        boolean previousSemesterPending = false;
        String pendingSemesterName = "";

        for (StudentSemesterFee record : feeRecords) {
            StudentSemesterFeeDto dto = mapStudentSemesterFeeToDto(record);

            if (previousSemesterPending) {
                dto.setLocked(true);
                dto.setLockedReason("Please clear all pending fees of " + pendingSemesterName + " before paying " + record.getSemester() + " fees.");
            } else {
                dto.setLocked(false);
                dto.setLockedReason(null);
            }

            // If this semester is not fully paid, lock any subsequent semesters!
            if (!"PAID".equalsIgnoreCase(record.getStatus())) {
                previousSemesterPending = true;
                pendingSemesterName = record.getSemester();
            }

            dtos.add(dto);
        }

        return dtos;
    }

    private String extractCoursePrefix(String courseName) {
        if (courseName == null || courseName.isBlank()) return "BA";
        String upper = courseName.toUpperCase();
        if (upper.contains("BSC") || upper.contains("SCIENCE")) return "BSC";
        return "BA";
    }

    // ── Student Pay Fee Types ──────────────────────────────────────────────────

    @Transactional
    public FeePaymentReceiptDto payFeeTypes(User student, PayFeeRequest request) {
        StudentSemesterFee ssf = studentSemesterFeeRepository.findById(request.getSemesterFeeId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentSemesterFee", "id", request.getSemesterFeeId()));

        if (!ssf.getUser().getId().equals(student.getId())) {
            throw new BadRequestException("Unauthorized fee payment request.");
        }

        // 1. Check Pending Fee Rule for prior semesters
        int targetSemIndex = getSemesterIndex(ssf.getSemester());
        List<StudentSemesterFee> allStudentFees = studentSemesterFeeRepository.findByUserOrderBySemesterAsc(student);
        for (StudentSemesterFee prior : allStudentFees) {
            int priorIndex = getSemesterIndex(prior.getSemester());
            if (priorIndex < targetSemIndex && !"PAID".equalsIgnoreCase(prior.getStatus())) {
                throw new BadRequestException("Please clear all pending fees of " + prior.getSemester() + " before paying " + ssf.getSemester() + " fees.");
            }
        }

        // 2. Validate selection
        if (!request.isPayAcademic() && !request.isPaySports() && !request.isPayExam() && !request.isPayOther()) {
            throw new BadRequestException("Please select at least one fee type to pay.");
        }

        double totalPaidInThisTx = 0.0;
        double academicAmt = 0.0;
        double sportsAmt = 0.0;
        double examAmt = 0.0;
        double otherAmt = 0.0;
        List<String> paidTypeList = new ArrayList<>();

        if (request.isPayAcademic()) {
            if (ssf.isAcademicPaid()) {
                throw new BadRequestException("Academic Fee for " + ssf.getSemester() + " is already paid.");
            }
            ssf.setAcademicPaid(true);
            academicAmt = ssf.getAcademicFee();
            totalPaidInThisTx += academicAmt;
            paidTypeList.add("Academic Fee");
        }

        if (request.isPaySports()) {
            if (ssf.isSportsPaid()) {
                throw new BadRequestException("Sports Fee for " + ssf.getSemester() + " is already paid.");
            }
            ssf.setSportsPaid(true);
            sportsAmt = ssf.getSportsFee();
            totalPaidInThisTx += sportsAmt;
            paidTypeList.add("Sports Fee");
        }

        if (request.isPayExam()) {
            if (ssf.isExamPaid()) {
                throw new BadRequestException("Exam Fee for " + ssf.getSemester() + " is already paid.");
            }
            ssf.setExamPaid(true);
            examAmt = ssf.getExamFee();
            totalPaidInThisTx += examAmt;
            paidTypeList.add("Exam Fee");
        }

        if (request.isPayOther()) {
            if (ssf.isOtherPaid()) {
                throw new BadRequestException("Other Fee for " + ssf.getSemester() + " is already paid.");
            }
            ssf.setOtherPaid(true);
            otherAmt = ssf.getOtherFee();
            totalPaidInThisTx += otherAmt;
            paidTypeList.add("Other Fee");
        }

        ssf.recalculateStatus();
        StudentSemesterFee updatedSsf = studentSemesterFeeRepository.save(ssf);

        // 3. Generate Receipt
        String receiptNumber = generateReceiptNumber();
        FeePaymentReceipt receipt = FeePaymentReceipt.builder()
                .receiptNumber(receiptNumber)
                .user(student)
                .studentSemesterFee(updatedSsf)
                .courseCode(updatedSsf.getCourseCode())
                .semester(updatedSsf.getSemester())
                .feeTypesPaid(String.join(", ", paidTypeList))
                .totalPaid(totalPaidInThisTx)
                .academicAmount(academicAmt)
                .sportsAmount(sportsAmt)
                .examAmount(examAmt)
                .otherAmount(otherAmt)
                .paymentDate(LocalDateTime.now())
                .paymentStatus("PAID")
                .build();

        FeePaymentReceipt savedReceipt = feePaymentReceiptRepository.save(receipt);

        // Update total student aggregate fee
        recalculateUserFees(student);

        return mapReceiptToDto(savedReceipt);
    }

    // ── Receipt Retrieval ───────────────────────────────────────────────────────

    public FeePaymentReceiptDto getReceiptById(Long receiptId, User currentUser) {
        FeePaymentReceipt receipt = feePaymentReceiptRepository.findById(receiptId)
                .orElseThrow(() -> new ResourceNotFoundException("FeePaymentReceipt", "id", receiptId));

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));
        if (!isAdmin && !receipt.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Unauthorized receipt access.");
        }

        return mapReceiptToDto(receipt);
    }

    // ── Admin Promotion System ──────────────────────────────────────────────────

    @Transactional
    public User promoteStudent(Long userId) {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String currentSem = student.getCurrentSemester();
        if (currentSem == null || currentSem.isBlank()) {
            currentSem = "Semester 1";
        }

        int currIndex = getSemesterIndex(currentSem);
        if (currIndex >= SEMESTERS.size() - 1) {
            throw new BadRequestException("Student is already in the final semester (" + currentSem + "). Cannot promote further.");
        }

        String nextSem = SEMESTERS.get(currIndex + 1);
        student.setCurrentSemester(nextSem);

        String courseCode = extractCoursePrefix(student.getCourseName());
        student.setCourseName(courseCode);

        User updatedUser = userRepository.save(student);

        // Initialize next semester fee record for the student
        initializeStudentSemesterFee(updatedUser, courseCode, nextSem);
        recalculateUserFees(updatedUser);

        log.info("Promoted student ID {} ({}) to {}", updatedUser.getId(), updatedUser.getStudentId(), nextSem);
        return updatedUser;
    }

    // ── Admin Student Management Filtered by Course and Semester ────────────────

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentsByCourseAndSemester(String courseCode, String semester) {
        String targetCourse = extractCoursePrefix(courseCode);
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> "ROLE_USER".equals(r.getName())))
                .filter(u -> extractCoursePrefix(u.getCourseName()).equalsIgnoreCase(targetCourse))
                .filter(u -> semester.equalsIgnoreCase(u.getCurrentSemester() != null ? u.getCurrentSemester() : "Semester 1"))
                .collect(Collectors.toList());

        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : students) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("studentId", u.getStudentId() != null ? u.getStudentId() : "STD-" + u.getId());
            map.put("studentName", u.getFullName());
            map.put("mobileNumber", u.getPhone() != null ? u.getPhone() : "-");
            map.put("dob", u.getDateOfBirth() != null ? u.getDateOfBirth().toString() : "-");
            map.put("course", u.getCourseName());
            map.put("semester", u.getCurrentSemester());

            // Fee calculations for student
            Optional<StudentSemesterFee> ssfOpt = studentSemesterFeeRepository.findByUserAndSemester(u, semester);
            if (ssfOpt.isPresent()) {
                StudentSemesterFee ssf = ssfOpt.get();
                map.put("totalFee", ssf.getTotalFee());
                map.put("paidFee", ssf.getPaidFee());
                map.put("remainingFee", ssf.getRemainingFee());
                map.put("status", ssf.getStatus());
            } else {
                map.put("totalFee", 0.0);
                map.put("paidFee", 0.0);
                map.put("remainingFee", 0.0);
                map.put("status", "PENDING");
            }

            map.put("active", u.isActive());
            result.add(map);
        }

        return result;
    }

    // ── Helper Methods ─────────────────────────────────────────────────────────

    private int getSemesterIndex(String semester) {
        int idx = SEMESTERS.indexOf(semester);
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

    private FeeStructureDto mapFeeStructureToDto(FeeStructure fs) {
        return FeeStructureDto.builder()
                .id(fs.getId())
                .courseCode(fs.getCourseCode())
                .semester(fs.getSemester())
                .academicFee(fs.getAcademicFee())
                .sportsFee(fs.getSportsFee())
                .examFee(fs.getExamFee())
                .otherFee(fs.getOtherFee())
                .totalFee(fs.getTotalFee())
                .build();
    }

    public StudentSemesterFeeDto mapStudentSemesterFeeToDto(StudentSemesterFee ssf) {
        List<FeePaymentReceiptDto> receipts = feePaymentReceiptRepository.findByStudentSemesterFeeId(ssf.getId())
                .stream()
                .map(this::mapReceiptToDto)
                .collect(Collectors.toList());

        return StudentSemesterFeeDto.builder()
                .id(ssf.getId())
                .userId(ssf.getUser().getId())
                .courseCode(ssf.getCourseCode())
                .semester(ssf.getSemester())
                .academicFee(ssf.getAcademicFee())
                .sportsFee(ssf.getSportsFee())
                .examFee(ssf.getExamFee())
                .otherFee(ssf.getOtherFee())
                .academicPaid(ssf.isAcademicPaid())
                .sportsPaid(ssf.isSportsPaid())
                .examPaid(ssf.isExamPaid())
                .otherPaid(ssf.isOtherPaid())
                .totalFee(ssf.getTotalFee())
                .paidFee(ssf.getPaidFee())
                .remainingFee(ssf.getRemainingFee())
                .status(ssf.getStatus())
                .receipts(receipts)
                .build();
    }

    public FeePaymentReceiptDto mapReceiptToDto(FeePaymentReceipt r) {
        return FeePaymentReceiptDto.builder()
                .id(r.getId())
                .receiptNumber(r.getReceiptNumber())
                .userId(r.getUser().getId())
                .studentName(r.getUser().getFullName())
                .studentId(r.getUser().getStudentId())
                .courseCode(r.getCourseCode())
                .semester(r.getSemester())
                .feeTypesPaid(r.getFeeTypesPaid())
                .academicAmount(r.getAcademicAmount())
                .sportsAmount(r.getSportsAmount())
                .examAmount(r.getExamAmount())
                .otherAmount(r.getOtherAmount())
                .totalPaid(r.getTotalPaid())
                .paymentDate(r.getPaymentDate())
                .paymentStatus(r.getPaymentStatus())
                .build();
    }
}
