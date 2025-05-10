package com.example.backend.repositories;

import com.example.backend.models.User;
import com.example.backend.models.UserBanData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserBanDataRepository extends JpaRepository<UserBanData, Long> {

    @Query("""
            SELECT u FROM UserBanData u
            WHERE (:user IS NULL or u.bannedUser = :user)
            """)
    Page<UserBanData> findByBannedUser(@Param("user") User user, Pageable pageable);
}