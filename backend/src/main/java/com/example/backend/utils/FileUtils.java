package com.example.backend.utils;


import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;

public class FileUtils {

    public static File convertMultipartFileToFile(MultipartFile multipartFile) throws IOException {
        File tempFile = Files.createTempFile("temp", ".tmp").toFile();

        try (OutputStream outputStream = new FileOutputStream(tempFile)) {
            outputStream.write(multipartFile.getBytes());
        }

        return tempFile;
    }
}