package com.example.backend.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "user_ban_data")
public class UserBanData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "is_permanent_ban")
    private Boolean isPermanentBan = false;

    @Column(name = "is_category_ban")
    private Boolean isCategoryBan = false;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "unban_at")
    private LocalDateTime unbanAt;

    @CreationTimestamp
    private LocalDateTime bannedAt;

    @Column(nullable = false)
    private String reason;

    @ManyToOne
    @JoinColumn(name = "moderator_id")
    private User moderator;

    @ManyToOne
    @JoinColumn(name = "banned_user_id")
    private User bannedUser;
}