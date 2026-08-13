package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_tokens",
    indexes = {
        @Index(name = "idx_otp_email", columnList = "email"),
        @Index(name = "idx_otp_token", columnList = "token")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "token", nullable = false, length = 10)
    private String token;

    @Column(name = "purpose", nullable = false, length = 30)
    private String purpose; // PASSWORD_RESET, EMAIL_VERIFY, LOGIN_OTP

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_used", nullable = false)
    @Builder.Default
    private boolean used = false;

    @Column(name = "attempts", nullable = false)
    @Builder.Default
    private int attempts = 0;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !used && !isExpired() && attempts < 5;
    }
}
