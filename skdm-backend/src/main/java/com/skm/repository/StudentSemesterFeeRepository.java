package com.skm.repository;

import com.skm.entity.StudentSemesterFee;
import com.skm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSemesterFeeRepository extends JpaRepository<StudentSemesterFee, Long> {
    List<StudentSemesterFee> findByUserOrderBySemesterAsc(User user);
    Optional<StudentSemesterFee> findByUserAndSemester(User user, String semester);
    List<StudentSemesterFee> findByCourseCodeAndSemester(String courseCode, String semester);
}
