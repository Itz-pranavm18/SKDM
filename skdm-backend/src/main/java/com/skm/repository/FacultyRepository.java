package com.skm.repository;

import com.skm.entity.Faculty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    List<Faculty> findByDeletedFalseAndActiveTrueOrderByDisplayOrder();

    @Query("""
        SELECT f FROM Faculty f
        LEFT JOIN f.department d
        WHERE f.deleted = false
        AND (:search IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(f.designation) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:departmentId IS NULL OR d.id = :departmentId)
        AND (:active IS NULL OR f.active = :active)
    """)
    Page<Faculty> filterFaculty(@Param("search") String search,
                                @Param("departmentId") Long departmentId,
                                @Param("active") Boolean active,
                                Pageable pageable);
}
