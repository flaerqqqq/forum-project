package com.example.backend.utils;

import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;

public class ImageUtils {

    public static Integer[] getImageWidthAndHeight(MultipartFile file) {
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            int height = image.getHeight();
            int width = image.getWidth();
            return new Integer[]{width, height};
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}