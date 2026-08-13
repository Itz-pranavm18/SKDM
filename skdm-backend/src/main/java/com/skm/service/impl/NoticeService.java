package com.skm.service.impl;

import com.skm.constants.AppConstants;
import com.skm.dto.NoticeDto;
import com.skm.entity.Notice;
import com.skm.exception.ResourceNotFoundException;
import com.skm.repository.NoticeRepository;
import com.skm.response.ApiResponse;
import com.skm.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NoticeService {

    private final NoticeRepository noticeRepository;

    @Cacheable(AppConstants.CACHE_NOTICES)
    @Transactional(readOnly = true)
    public ApiResponse<List<NoticeDto>> getActiveNotices() {
        List<NoticeDto> notices = noticeRepository.findActiveNotices(LocalDate.now())
                .stream().map(this::mapToDto).collect(Collectors.toList());
        return ApiResponse.success(notices, "Notices retrieved successfully");
    }

    @Transactional(readOnly = true)
    public ApiResponse<PagedResponse<NoticeDto>> getAllNoticesAdmin(String tag, String search,
                                                                     Boolean active, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("noticeDate").descending());
        Page<Notice> noticePage = noticeRepository.filterNotices(tag, search, active, pageable);
        return ApiResponse.success(PagedResponse.of(noticePage.map(this::mapToDto)), "Notices retrieved");
    }

    @Transactional(readOnly = true)
    public ApiResponse<NoticeDto> getNoticeById(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice", "id", id));
        return ApiResponse.success(mapToDto(notice), "Notice retrieved");
    }

    @CacheEvict(value = AppConstants.CACHE_NOTICES, allEntries = true)
    public ApiResponse<NoticeDto> createNotice(NoticeDto dto) {
        Notice notice = new Notice();
        mapFromDto(dto, notice);
        noticeRepository.save(notice);
        return ApiResponse.created(mapToDto(notice), "Notice created successfully");
    }

    @CacheEvict(value = AppConstants.CACHE_NOTICES, allEntries = true)
    public ApiResponse<NoticeDto> updateNotice(Long id, NoticeDto dto) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice", "id", id));
        mapFromDto(dto, notice);
        noticeRepository.save(notice);
        return ApiResponse.success(mapToDto(notice), "Notice updated successfully");
    }

    @CacheEvict(value = AppConstants.CACHE_NOTICES, allEntries = true)
    public ApiResponse<Void> deleteNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice", "id", id));
        notice.softDelete();
        noticeRepository.save(notice);
        return ApiResponse.ok("Notice deleted successfully");
    }

    private void mapFromDto(NoticeDto dto, Notice notice) {
        notice.setTitle(dto.getTitle());
        notice.setContent(dto.getContent());
        notice.setNoticeDate(dto.getNoticeDate() != null ? dto.getNoticeDate() : LocalDate.now());
        notice.setTag(dto.getTag());
        notice.setAttachmentUrl(dto.getAttachmentUrl());
        notice.setPinned(dto.isPinned());
        notice.setActive(dto.isActive());
        notice.setExpiresAt(dto.getExpiresAt());
    }

    private NoticeDto mapToDto(Notice n) {
        return NoticeDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getContent())
                .noticeDate(n.getNoticeDate())
                .tag(n.getTag())
                .attachmentUrl(n.getAttachmentUrl())
                .pinned(n.isPinned())
                .active(n.isActive())
                .expiresAt(n.getExpiresAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
