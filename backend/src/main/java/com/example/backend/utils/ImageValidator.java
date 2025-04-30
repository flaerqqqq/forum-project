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
    private static final int ICON_MIN_HEIGHT = 64;
    private static final int ICON_MAX_HEIGHT = 4096;
    private static final int ICON_MIN_WIDTH = 64;
    private static final int ICON_MAX_WIDTH = 4096;
    private static final double ICON_MIN_ASPECT_RATIO = 0.5;
    private static final double ICON_MAX_ASPECT_RATIO = 2;

    private static final int BANNER_MIN_HEIGHT = 256;
    private static final int BANNER_MAX_HEIGHT = 8192;
    private static final int BANNER_MIN_WIDTH = 256;
    private static final int BANNER_MAX_WIDTH = 8192;
    private static final double BANNER_MIN_ASPECT_RATIO = 0.25;
    private static final double BANNER_MAX_ASPECT_RATIO = 4;

    private final AmazonRekognition rekognitionClient;

    public void validateBannerFormatImage(MultipartFile file) {
        try {
            validateFileType(file);
            validateBannerDimensions(file);
            validateImageContentModeration(file);
        } catch (Exception e) {
            throw new ImageValidationException(e);
        }
    }

    public void validateIconFormatImage(MultipartFile file) {
        try {
            validateFileType(file);
            validateIconDimensions(file);
            validateImageContentModeration(file);
        } catch (Exception e) {
            throw new ImageValidationException(e);
        }
    }

    private void validateIconDimensions(MultipartFile file) throws IOException {
        validateDimensions(file, ICON_MIN_HEIGHT, ICON_MIN_WIDTH, ICON_MAX_HEIGHT, ICON_MAX_WIDTH, ICON_MIN_ASPECT_RATIO, ICON_MAX_ASPECT_RATIO);
    }

    private void validateBannerDimensions(MultipartFile file) throws IOException {
        validateDimensions(file, BANNER_MIN_HEIGHT, BANNER_MIN_WIDTH, BANNER_MAX_HEIGHT, BANNER_MAX_WIDTH, BANNER_MIN_ASPECT_RATIO, BANNER_MAX_ASPECT_RATIO);
    }

    private void validateDimensions(MultipartFile file, int minHeight, int minWidth, int maxHeight, int maxWidth, double minAspectRatio, double maxAspectRatio) throws IOException {
        BufferedImage image = ImageIO.read(file.getInputStream());
        int height = image.getHeight();
        int width = image.getWidth();
        double aspectRatio = (double) width / height;

        if (height < minHeight || width < minWidth) {
            throw new ImageValidationException("Minimum image size is %dx%d, but given is %dx%d".formatted(minWidth, minHeight, width, height));
        } else if (height > maxHeight || width > maxWidth) {
            throw new ImageValidationException("Maximum image size is %dx%d, but given is %dx%d".formatted(maxWidth, maxHeight, width, height));
        } else if (aspectRatio < minAspectRatio) {
            throw new ImageValidationException("Minimum aspect ratio is %s, but given is %s".formatted(minAspectRatio, aspectRatio));
        } else if (aspectRatio > maxAspectRatio) {
            throw new ImageValidationException("Maximum aspect ratio is %s, but given is %s".formatted(maxAspectRatio, aspectRatio));
        }
    }

    private void validateFileType(MultipartFile file) {
        String contentType = file.getContentType();
        if ( contentType != null && !contentType.equals("image/jpeg") && !contentType.equals("image/png")) {
            throw new ImageValidationException("The file must be either in a .jpg or a .png format");
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