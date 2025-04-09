package com.example.backend.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Entity
@Table(name = "email_confirm_tokens")
public class EmailConfirmToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private long id;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "expire_at", nullable = false)
    private Date expireAt;

    @PrePersist
    protected void calculateExpirationDate() {
        expireAt = new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000);
    }

}