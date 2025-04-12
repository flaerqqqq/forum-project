package com.example.backend.utils;

import com.amazonaws.services.rekognition.AmazonRekognition;
import com.amazonaws.services.rekognition.model.DetectModerationLabelsRequest;
import com.amazonaws.services.rekognition.model.DetectModerationLabelsResult;
import com.amazonaws.services.rekognition.model.Image;
import com.amazonaws.services.rekognition.model.ModerationLabel;
import com.example.backend.exceptions.ImageValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ImageValidator {

    private static final float MIN_CONFIDENCE = 75F;
    private static final int MIN_HEIGHT = 250;
    private static final int MAX_HEIGHT = 2000;
    private static final int MIN_WIDTH = 250;
    private static final int MAX_WIDTH = 2000;
    private static final double MIN_ASPECT_RATIO = 0.5;
    private static final double MAX_ASPECT_RATIO = 2;

    private final AmazonRekognition rekognitionClient;

    public void validateAvatar(MultipartFile file) {
        try {
            validateFileType(file);
            validateImageDimensions(file);
            validateImageContentModeration(file);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void validateFileType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType.equals("image/jpg") || contentType.equals("image/png")) {
            throw new ImageValidationException("The file must be either in a .jpg or a .png format");
        }
    }

    private void validateImageDimensions(MultipartFile file) throws IOException {
        BufferedImage image = ImageIO.read(file.getInputStream());
        int height = image.getHeight();
        int width = image.getWidth();
        double aspectRatio = (double)width / height;

        if (height < MIN_HEIGHT || width < MIN_WIDTH) {
            throw new ImageValidationException("Minimum image size is %dx%d, but given is %dx%d".formatted(MIN_WIDTH, MIN_HEIGHT, width, height));
        } else if (height > MAX_HEIGHT || width > MAX_WIDTH) {
            throw new ImageValidationException("Maximum image size is %dx%d, but given is %dx%d".formatted(MAX_WIDTH, MAX_HEIGHT, width, height));
        } else if (aspectRatio < MIN_ASPECT_RATIO) {
            throw new ImageValidationException("Minimum aspect ratio is %s, but given is %s".formatted(MIN_ASPECT_RATIO, aspectRatio));
        } else if (aspectRatio > MAX_ASPECT_RATIO) {
            throw new ImageValidationException("Maximum aspect ratio is %s, but given is %s".formatted(MAX_ASPECT_RATIO, aspectRatio));
        }
    }

    private void validateImageContentModeration(MultipartFile file) throws IOException {
        Image image = new Image().withBytes(ByteBuffer.wrap(file.getBytes()));

        DetectModerationLabelsRequest request = new DetectModerationLabelsRequest()
                .withImage(image)
                .withMinConfidence(MIN_CONFIDENCE);

        DetectModerationLabelsResult result = rekognitionClient.detectModerationLabels(request);
        List<ModerationLabel> moderationLabels = result.getModerationLabels();

        if (!moderationLabels.isEmpty()) {
            String labelsString = moderationLabels.stream()
                    .map(ModerationLabel::getName)
                    .collect(Collectors.joining(", "));
            throw new ImageValidationException("The given picture has an inappropriate content: %s".formatted(labelsString));
        }
    }
}