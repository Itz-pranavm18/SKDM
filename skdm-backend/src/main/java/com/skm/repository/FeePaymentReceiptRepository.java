package com.skm.repository;

import com.skm.entity.FeePaymentReceipt;
import com.skm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeePaymentReceiptRepository extends JpaRepository<FeePaymentReceipt, Long> {
    List<FeePaymentReceipt> findByUserOrderByPaymentDateDesc(User user);
    List<FeePaymentReceipt> findByStudentSemesterFeeId(Long studentSemesterFeeId);
    Optional<FeePaymentReceipt> findByReceiptNumber(String receiptNumber);
}
