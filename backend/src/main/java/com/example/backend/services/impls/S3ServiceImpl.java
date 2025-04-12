package com.example.backend.services.impls;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.example.backend.services.S3Service;
import com.example.backend.utils.FileUtils;
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

    private final AmazonS3 s3Client;

    @Override
    public String uploadAvatar(MultipartFile file) {
        String key = UUID.randomUUID().toString();
        try {
            File tempFile = FileUtils.convertMultipartFileToFile(file);

            PutObjectRequest putRequest = new PutObjectRequest(avatarBucketName, key, tempFile);
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(tempFile.length());
            metadata.setContentType(file.getContentType());
            putRequest.setMetadata(metadata);

            s3Client.putObject(putRequest);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return s3Client.getUrl(avatarBucketName, key).toExternalForm();
    }

    @Override
    public void deleteAvatar(String url) {
        String key = url.substring(url.lastIndexOf('/') + 1);
        s3Client.deleteObject(avatarBucketName, key);
    }
}