package com.skm.repository;

import com.skm.entity.GalleryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GalleryRepository extends JpaRepository<GalleryItem, Long> {
    List<GalleryItem> findByDeletedFalseAndActiveTrueOrderByDisplayOrder();
    List<GalleryItem> findByDeletedFalseAndActiveTrueAndTagOrderByDisplayOrder(String tag);
    List<GalleryItem> findByDeletedFalseAndActiveTrueAndFeaturedTrueOrderByDisplayOrder();
}
