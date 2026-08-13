package com.skm.repository;

import com.skm.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByDeletedFalseAndActiveTrue();
    Page<Course> findByDeletedFalse(Pageable pageable);
    java.util.Optional<Course> findByCode(String code);
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Long id);

    @Query("""
        SELECT c FROM Course c
        LEFT JOIN c.department d
        WHERE c.deleted = false
        AND (:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:departmentId IS NULL OR d.id = :departmentId)
        AND (:active IS NULL OR c.active = :active)
    """)
    Page<Course> filterCourses(@Param("search") String search,
                               @Param("departmentId") Long departmentId,
                               @Param("active") Boolean active,
                               Pageable pageable);
}
