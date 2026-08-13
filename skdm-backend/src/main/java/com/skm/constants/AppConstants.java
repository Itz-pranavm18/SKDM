package com.skm.constants;

public final class AppConstants {

    private AppConstants() {}

    // Roles
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_USER  = "ROLE_USER";

    // Cache names
    public static final String CACHE_COURSES    = "courses";
    public static final String CACHE_FACULTY    = "faculty";
    public static final String CACHE_NOTICES    = "notices";
    public static final String CACHE_GALLERY    = "gallery";
    public static final String CACHE_EVENTS     = "events";
    public static final String CACHE_TESTIMONIALS = "testimonials";
    public static final String CACHE_SETTINGS   = "settings";
    public static final String CACHE_DEPARTMENTS = "departments";

    // Pagination
    public static final int    DEFAULT_PAGE     = 0;
    public static final int    DEFAULT_SIZE     = 10;
    public static final int    MAX_SIZE         = 100;
    public static final String DEFAULT_SORT_BY  = "createdAt";
    public static final String DEFAULT_SORT_DIR = "desc";

    // File upload
    public static final long   MAX_FILE_SIZE    = 10 * 1024 * 1024L; // 10 MB
    public static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"};
    public static final String[] ALLOWED_DOC_TYPES   = {"application/pdf", "image/jpeg", "image/png"};

    // Admission statuses
    public static final String ADMISSION_PENDING  = "PENDING";
    public static final String ADMISSION_APPROVED = "APPROVED";
    public static final String ADMISSION_REJECTED = "REJECTED";
    public static final String ADMISSION_WAITLIST = "WAITLISTED";

    // Token types
    public static final String TOKEN_TYPE_ACCESS  = "ACCESS";
    public static final String TOKEN_TYPE_REFRESH = "REFRESH";
    public static final String TOKEN_TYPE_RESET   = "RESET";
    public static final String TOKEN_TYPE_VERIFY  = "VERIFY";

    // Email subjects
    public static final String EMAIL_SUBJECT_WELCOME   = "Welcome to SKM College";
    public static final String EMAIL_SUBJECT_RESET     = "Reset Your Password — SKM College";
    public static final String EMAIL_SUBJECT_VERIFY    = "Verify Your Email — SKM College";
    public static final String EMAIL_SUBJECT_APPROVED  = "Admission Approved — SKM College";
    public static final String EMAIL_SUBJECT_REJECTED  = "Regarding Your Admission — SKM College";
    public static final String EMAIL_SUBJECT_OTP       = "Your OTP — SKM College";

    // OTP
    public static final int OTP_LENGTH = 6;

    // Activity log actions
    public static final String ACTION_LOGIN          = "USER_LOGIN";
    public static final String ACTION_LOGOUT         = "USER_LOGOUT";
    public static final String ACTION_REGISTER       = "USER_REGISTER";
    public static final String ACTION_APPLY          = "ADMISSION_APPLY";
    public static final String ACTION_APPROVE        = "ADMISSION_APPROVE";
    public static final String ACTION_REJECT         = "ADMISSION_REJECT";
    public static final String ACTION_PASSWORD_RESET = "PASSWORD_RESET";
    public static final String ACTION_FILE_UPLOAD    = "FILE_UPLOAD";
    public static final String ACTION_PROFILE_UPDATE = "PROFILE_UPDATE";
}
