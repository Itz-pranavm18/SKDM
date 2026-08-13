package com.skm.repository;

import com.skm.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByDeletedFalseAndActiveTrueAndEventDateGreaterThanEqualOrderByEventDate(LocalDate date);
    List<Event> findByDeletedFalseAndActiveTrueAndFeaturedTrueOrderByEventDate();

    @Query("""
        SELECT e FROM Event e WHERE e.deleted = false
        AND (:search IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:category IS NULL OR e.category = :category)
        AND (:active IS NULL OR e.active = :active)
    """)
    Page<Event> filterEvents(@Param("search") String search,
                             @Param("category") String category,
                             @Param("active") Boolean active,
                             Pageable pageable);
}
