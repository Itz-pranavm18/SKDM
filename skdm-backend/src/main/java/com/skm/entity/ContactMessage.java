package com.skm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contact_messages",
    indexes = @Index(name = "idx_contact_status", columnList = "status"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContactMessage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "phone", length = 15)
    private String phone;

    @Column(name = "subject", length = 200)
    private String subject;

    @Column(name = "message", nullable = false, length = 3000)
    private String message;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "UNREAD"; // UNREAD, READ, REPLIED, ARCHIVED

    @Column(name = "reply", length = 3000)
    private String reply;

    @Column(name = "replied_by", length = 100)
    private String repliedBy;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;
}
