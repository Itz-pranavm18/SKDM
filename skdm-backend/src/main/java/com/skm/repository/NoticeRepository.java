package com.skm.repository;

import com.skm.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {

    @Query("""
        SELECT n FROM Notice n WHERE n.deleted = false AND n.active = true
        AND (n.expiresAt IS NULL OR n.expiresAt >= :today)
        ORDER BY n.pinned DESC, n.noticeDate DESC
    """)
    List<Notice> findActiveNotices(@Param("today") LocalDate today);

    @Query("""
        SELECT n FROM Notice n WHERE n.deleted = false
        AND (:tag IS NULL OR n.tag = :tag)
        AND (:search IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:active IS NULL OR n.active = :active)
    """)
    Page<Notice> filterNotices(@Param("tag") String tag,
                               @Param("search") String search,
                               @Param("active") Boolean active,
                               Pageable pageable);
}
