package com.skm.repository;

import com.skm.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailAndDeletedFalse(String email);
    Optional<User> findByUsernameAndDeletedFalse(String username);
    Optional<User> findByIdAndDeletedFalse(Long id);

    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmailAndIdNot(String email, Long id);
    boolean existsByUsernameAndIdNot(String username, Long id);

    Page<User> findAllByDeletedFalse(Pageable pageable);

    @Query("""
        SELECT u FROM User u
        WHERE u.deleted = false
        AND (:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:active IS NULL OR u.active = :active)
        AND (:suspended IS NULL OR u.suspended = :suspended)
    """)
    Page<User> searchUsers(@Param("search") String search,
                           @Param("active") Boolean active,
                           @Param("suspended") Boolean suspended,
                           Pageable pageable);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = u.failedLoginAttempts + 1 WHERE u.id = :id")
    void incrementFailedAttempts(@Param("id") Long id);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = 0, u.lockedUntil = NULL WHERE u.id = :id")
    void resetFailedAttempts(@Param("id") Long id);

    @Modifying
    @Query("UPDATE User u SET u.lockedUntil = :until WHERE u.id = :id")
    void lockUser(@Param("id") Long id, @Param("until") LocalDateTime until);

    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = :loginAt, u.lastLoginIp = :ip WHERE u.id = :id")
    void updateLastLogin(@Param("id") Long id, @Param("loginAt") LocalDateTime loginAt, @Param("ip") String ip);

    long countByDeletedFalse();
    long countByDeletedFalseAndActive(boolean active);

    @Query("SELECT COUNT(u) FROM User u WHERE u.deleted = false AND u.studentId IS NOT NULL")
    long countByDeletedFalseAndStudentIdNotNull();
}
