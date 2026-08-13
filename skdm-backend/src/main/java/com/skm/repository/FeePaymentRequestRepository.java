package com.skm.repository;

import com.skm.entity.FeePaymentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeePaymentRequestRepository extends JpaRepository<FeePaymentRequest, Long> {

    List<FeePaymentRequest> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);

    List<FeePaymentRequest> findByStatusAndDeletedFalseOrderByCreatedAtDesc(String status);

    List<FeePaymentRequest> findByDeletedFalseOrderByCreatedAtDesc();

    long countByStatusAndDeletedFalse(String status);

    @Query("SELECT SUM(f.amount) FROM FeePaymentRequest f WHERE f.status = 'VERIFIED' AND f.deleted = false")
    Double sumTotalCollectedFees();
}
