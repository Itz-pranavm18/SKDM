package com.skm.repository;

import com.skm.entity.Admission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, Long> {

    Optional<Admission> findByApplicationNumber(String applicationNumber);

    List<Admission> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Admission> findAllByDeletedFalse(Pageable pageable);

    @Query("""
        SELECT a FROM Admission a
        LEFT JOIN a.course c
        LEFT JOIN a.user u
        WHERE a.deleted = false
        AND (u IS NULL OR u.deleted = false)
        AND (:status IS NULL OR a.status = :status)
        AND (:courseId IS NULL OR c.id = :courseId)
        AND (:sessionYear IS NULL OR a.sessionYear = :sessionYear)
        AND (:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(a.applicationNumber) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Admission> filterAdmissions(@Param("status") String status,
                                     @Param("courseId") Long courseId,
                                     @Param("sessionYear") String sessionYear,
                                     @Param("search") String search,
                                     Pageable pageable);

    long countByDeletedFalse();

    @Query("SELECT COUNT(a) FROM Admission a WHERE a.deleted = false AND (a.user IS NULL OR a.user.deleted = false)")
    long countByDeletedFalseAndUserDeletedFalse();

    long countByStatusAndDeletedFalse(String status);

    boolean existsByUserIdAndCourseIdAndSessionYear(Long userId, Long courseId, String sessionYear);

    @Query("SELECT a.status, COUNT(a) FROM Admission a WHERE a.deleted = false AND (a.user IS NULL OR a.user.deleted = false) GROUP BY a.status")
    List<Object[]> countByStatusGrouped();
}
