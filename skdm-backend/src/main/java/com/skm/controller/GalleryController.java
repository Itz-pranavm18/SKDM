package com.skm.controller;

import com.skm.constants.AppConstants;
import com.skm.dto.GalleryItemDto;
import com.skm.dto.TestimonialDto;
import com.skm.entity.GalleryItem;
import com.skm.entity.Testimonial;
import com.skm.exception.ResourceNotFoundException;
import com.skm.repository.GalleryRepository;
import com.skm.repository.TestimonialRepository;
import com.skm.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Gallery & Testimonials", description = "Gallery and testimonials APIs")
public class GalleryController {

    private final GalleryRepository galleryRepository;
    private final TestimonialRepository testimonialRepository;

    // ── Gallery (public) ──────────────────────────────────────────────────────

    @GetMapping("/gallery")
    @Cacheable(AppConstants.CACHE_GALLERY)
    @Operation(summary = "Get all active gallery items (public)")
    public ResponseEntity<ApiResponse<?>> getGallery(@RequestParam(required = false) String tag) {
        List<GalleryItem> items = tag != null
                ? galleryRepository.findByDeletedFalseAndActiveTrueAndTagOrderByDisplayOrder(tag)
                : galleryRepository.findByDeletedFalseAndActiveTrueOrderByDisplayOrder();
        List<GalleryItemDto> dtos = items.stream().map(this::mapGalleryToDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "Gallery retrieved successfully"));
    }

    // ── Testimonials (public) ─────────────────────────────────────────────────

    @GetMapping("/testimonials")
    @Cacheable(AppConstants.CACHE_TESTIMONIALS)
    @Operation(summary = "Get all active testimonials (public)")
    public ResponseEntity<ApiResponse<?>> getTestimonials() {
        List<Testimonial> testimonials = testimonialRepository.findByDeletedFalseAndActiveTrueOrderByDisplayOrder();
        List<TestimonialDto> dtos = testimonials.stream().map(this::mapTestimonialToDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "Testimonials retrieved successfully"));
    }

    // ── Admin: Gallery CRUD ───────────────────────────────────────────────────

    @PostMapping("/admin/gallery")
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = AppConstants.CACHE_GALLERY, allEntries = true)
    public ResponseEntity<ApiResponse<?>> createGalleryItem(@RequestBody GalleryItemDto dto) {
        GalleryItem item = GalleryItem.builder()
                .caption(dto.getCaption()).imageUrl(dto.getImageUrl()).thumbnailUrl(dto.getThumbnailUrl())
                .tag(dto.getTag()).altText(dto.getAltText()).active(dto.isActive())
                .featured(dto.isFeatured()).displayOrder(dto.getDisplayOrder()).build();
        galleryRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(mapGalleryToDto(item), "Gallery item created"));
    }

    @PutMapping("/admin/gallery/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = AppConstants.CACHE_GALLERY, allEntries = true)
    public ResponseEntity<ApiResponse<?>> updateGalleryItem(@PathVariable Long id, @RequestBody GalleryItemDto dto) {
        GalleryItem item = galleryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery item", "id", id));
        item.setCaption(dto.getCaption()); item.setImageUrl(dto.getImageUrl());
        item.setThumbnailUrl(dto.getThumbnailUrl()); item.setTag(dto.getTag());
        item.setAltText(dto.getAltText()); item.setActive(dto.isActive());
        item.setFeatured(dto.isFeatured()); item.setDisplayOrder(dto.getDisplayOrder());
        galleryRepository.save(item);
        return ResponseEntity.ok(ApiResponse.success(mapGalleryToDto(item), "Gallery item updated"));
    }

    @DeleteMapping("/admin/gallery/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = AppConstants.CACHE_GALLERY, allEntries = true)
    public ResponseEntity<ApiResponse<?>> deleteGalleryItem(@PathVariable Long id) {
        GalleryItem item = galleryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery item", "id", id));
        item.softDelete();
        galleryRepository.save(item);
        return ResponseEntity.ok(ApiResponse.ok("Gallery item deleted"));
    }

    // ── Admin: Testimonials CRUD ──────────────────────────────────────────────

    @PostMapping("/admin/testimonials")
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = AppConstants.CACHE_TESTIMONIALS, allEntries = true)
    public ResponseEntity<ApiResponse<?>> createTestimonial(@RequestBody TestimonialDto dto) {
        Testimonial t = Testimonial.builder()
                .studentName(dto.getStudentName()).batchYear(dto.getBatchYear()).quote(dto.getQuote())
                .photoUrl(dto.getPhotoUrl()).course(dto.getCourse()).rating(dto.getRating())
                .active(dto.isActive()).featured(dto.isFeatured()).displayOrder(dto.getDisplayOrder()).build();
        testimonialRepository.save(t);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(mapTestimonialToDto(t), "Testimonial created"));
    }

    @PutMapping("/admin/testimonials/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = AppConstants.CACHE_TESTIMONIALS, allEntries = true)
    public ResponseEntity<ApiResponse<?>> updateTestimonial(@PathVariable Long id, @RequestBody TestimonialDto dto) {
        Testimonial t = testimonialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial", "id", id));
        t.setStudentName(dto.getStudentName()); t.setBatchYear(dto.getBatchYear());
        t.setQuote(dto.getQuote()); t.setPhotoUrl(dto.getPhotoUrl());
        t.setCourse(dto.getCourse()); t.setRating(dto.getRating());
        t.setActive(dto.isActive()); t.setFeatured(dto.isFeatured()); t.setDisplayOrder(dto.getDisplayOrder());
        testimonialRepository.save(t);
        return ResponseEntity.ok(ApiResponse.success(mapTestimonialToDto(t), "Testimonial updated"));
    }

    @DeleteMapping("/admin/testimonials/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = AppConstants.CACHE_TESTIMONIALS, allEntries = true)
    public ResponseEntity<ApiResponse<?>> deleteTestimonial(@PathVariable Long id) {
        Testimonial t = testimonialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial", "id", id));
        t.softDelete();
        testimonialRepository.save(t);
        return ResponseEntity.ok(ApiResponse.ok("Testimonial deleted"));
    }

    // ── Private mappers ───────────────────────────────────────────────────────

    private GalleryItemDto mapGalleryToDto(GalleryItem g) {
        return GalleryItemDto.builder().id(g.getId()).caption(g.getCaption()).imageUrl(g.getImageUrl())
                .thumbnailUrl(g.getThumbnailUrl()).tag(g.getTag()).altText(g.getAltText())
                .active(g.isActive()).featured(g.isFeatured()).displayOrder(g.getDisplayOrder())
                .createdAt(g.getCreatedAt()).build();
    }

    private TestimonialDto mapTestimonialToDto(Testimonial t) {
        return TestimonialDto.builder().id(t.getId()).studentName(t.getStudentName())
                .batchYear(t.getBatchYear()).quote(t.getQuote()).photoUrl(t.getPhotoUrl())
                .course(t.getCourse()).rating(t.getRating()).active(t.isActive())
                .featured(t.isFeatured()).displayOrder(t.getDisplayOrder()).createdAt(t.getCreatedAt()).build();
    }
}
