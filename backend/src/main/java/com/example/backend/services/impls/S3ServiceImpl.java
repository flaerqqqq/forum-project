package com.example.backend.services.impls;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.example.backend.exceptions.S3UploadException;
import com.example.backend.services.S3Service;
import com.example.backend.utils.FileUtils;
import com.example.backend.utils.ImageValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class S3ServiceImpl implements S3Service {

    @Value("${aws.user-avatars-bucket.name}")
    private String avatarBucketName;

    @Value("${aws.category-banners.name}")
    private String categoryBannerBucketName;

    @Value("${aws.category-icons.name}")
    private String categoryIconBucketName;

    private final AmazonS3 s3Client;
    private final ImageValidator imageValidator;

    @Override
    public String uploadAvatar(MultipartFile file) {
        imageValidator.validateIconFormatImage(file);
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        return uploadFile(file, avatarBucketName, metadata);
    }

    @Override
    public void deleteAvatar(String url) {
        deleteByUrl(avatarBucketName, url);
    }

    @Override
    public void deleteCategoryIcon(String url) {
        deleteByUrl(categoryIconBucketName, url);
    }

    @Override
    public void deleteCategoryBanner(String url) {
        deleteByUrl(categoryBannerBucketName, url);
    }

    @Override
    public String uploadCategoryBanner(MultipartFile file) {
        imageValidator.validateBannerFormatImage(file);
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        return uploadFile(file, categoryBannerBucketName, metadata);
    }

    @Override
    public String uploadCategoryIcon(MultipartFile file) {
        imageValidator.validateIconFormatImage(file);
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        return uploadFile(file, categoryIconBucketName, metadata);
    }

    private String uploadFile(MultipartFile file, String bucketName, ObjectMetadata metadata) {
        String key = UUID.randomUUID().toString();
        try {
            File tempFile = FileUtils.convertMultipartFileToFile(file);

            PutObjectRequest putRequest = new PutObjectRequest(bucketName, key, tempFile);
            putRequest.setMetadata(metadata);

            s3Client.putObject(putRequest);
        } catch (Exception e) {
            throw new S3UploadException(e);
        }

        return s3Client.getUrl(bucketName, key).toExternalForm();
    }

    private void deleteByUrl(String bucketName, String url) {
        String key = url.substring(url.lastIndexOf('/') + 1);
        s3Client.deleteObject(bucketName, key);
    }
}