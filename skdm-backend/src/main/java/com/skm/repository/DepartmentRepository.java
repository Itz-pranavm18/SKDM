package com.skm.repository;

import com.skm.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByDeletedFalseAndActiveTrueOrderByDisplayOrder();
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Long id);
    boolean existsByName(String name);
}
