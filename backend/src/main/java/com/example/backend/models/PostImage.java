package com.example.backend.models;

import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "post_images")
public class PostImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private Integer width;

    @Column(nullable = false)
    private Integer height;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
}