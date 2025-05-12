package com.example.backend.repositories;

import com.example.backend.models.Category;
import com.example.backend.models.User;
import com.example.backend.models.UserBanData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface UserBanDataRepository extends JpaRepository<UserBanData, Long> {

    @Query("""
    SELECT ubd FROM UserBanData ubd
    WHERE (ubd.isCategoryBan = FALSE)
      AND (:user IS NULL OR ubd.bannedUser = :user)
      AND (:isPermanentBan IS NULL OR ubd.isPermanentBan = :isPermanentBan)
      AND (:#{#unbanTimeStartParam == null} = TRUE OR (ubd.unbanAt IS NOT NULL AND ubd.unbanAt >= :unbanTimeStartParam))
      AND (:#{#unbanTimeEndParam == null} = TRUE OR (ubd.unbanAt IS NOT NULL AND ubd.unbanAt <= :unbanTimeEndParam))
""")
    Page<UserBanData> findByFilters(
            @Param("user") User user,
            @Param("isPermanentBan") Boolean isPermanentBan,
            @Param("unbanTimeStartParam") LocalDateTime unbanTimeStart,
            @Param("unbanTimeEndParam") LocalDateTime unbanTimeEnd,
            Pageable pageable
    );

    @Query("""
    SELECT ubd FROM UserBanData ubd
    WHERE (ubd.isCategoryBan IS NOT NULL) 
      AND (:category IS NOT NULL AND :category = ubd.category)
      AND (:user IS NULL OR ubd.bannedUser = :user)
      AND (:isPermanentBan IS NULL OR ubd.isPermanentBan = :isPermanentBan)
      AND (:#{#unbanTimeStartParam == null} = TRUE OR (ubd.unbanAt IS NOT NULL AND ubd.unbanAt >= :unbanTimeStartParam))
      AND (:#{#unbanTimeEndParam == null} = TRUE OR (ubd.unbanAt IS NOT NULL AND ubd.unbanAt <= :unbanTimeEndParam))
""")
    Page<UserBanData> findCategoryBansByFilters(
            @Param("category") Category category,
            @Param("user") User user,
            @Param("isPermanentBan") Boolean isPermanentBan,
            @Param("unbanTimeStartParam") LocalDateTime unbanTimeStart,
            @Param("unbanTimeEndParam") LocalDateTime unbanTimeEnd,
            Pageable pageable
    );
}