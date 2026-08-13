package com.skm.repository;

import com.skm.entity.ContactMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    Page<ContactMessage> findByDeletedFalseOrderByCreatedAtDesc(Pageable pageable);
    Page<ContactMessage> findByDeletedFalseAndStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    long countByDeletedFalseAndStatus(String status);
}
