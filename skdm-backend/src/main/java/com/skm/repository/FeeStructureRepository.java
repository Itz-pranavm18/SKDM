package com.skm.repository;

import com.skm.entity.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    Optional<FeeStructure> findByCourseCodeAndSemester(String courseCode, String semester);
    List<FeeStructure> findByCourseCode(String courseCode);
    List<FeeStructure> findAllByOrderByCourseCodeAscSemesterAsc();
}
