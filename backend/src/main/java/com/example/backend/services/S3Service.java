package com.example.backend.services;

import org.springframework.web.multipart.MultipartFile;

public interface S3Service {

    String uploadAvatar(MultipartFile file);

    void deleteAvatar(String url);

    void deleteCategoryIcon(String url);

    void deleteCategoryBanner(String url);

    String uploadCategoryBanner(MultipartFile file);

    String uploadCategoryIcon(MultipartFile file);
}