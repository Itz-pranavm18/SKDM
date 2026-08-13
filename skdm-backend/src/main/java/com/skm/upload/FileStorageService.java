package com.skm.upload;

import com.skm.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Value("${server.port:8080}")
    private int serverPort;

    public String storeFile(MultipartFile file, String subdirectory) {
        validateFile(file);

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = getExtension(originalFilename);
        String storedName = UUID.randomUUID() + "." + extension;

        try {
            Path uploadPath = Paths.get(uploadDir, subdirectory).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            Path targetLocation = uploadPath.resolve(storedName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/" + subdirectory + "/" + storedName;
            log.info("File stored: {} -> {}", originalFilename, fileUrl);
            return fileUrl;
        } catch (IOException ex) {
            throw new BadRequestException("Could not store file. Please try again: " + ex.getMessage());
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;
        try {
            String relativePath = fileUrl.startsWith("/uploads/") ? fileUrl.substring(9) : fileUrl;
            Path filePath = Paths.get(uploadDir, relativePath).toAbsolutePath().normalize();
            Files.deleteIfExists(filePath);
            log.info("File deleted: {}", fileUrl);
        } catch (IOException e) {
            log.warn("Failed to delete file {}: {}", fileUrl, e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }
        if (file.getSize() > 10 * 1024 * 1024L) {
            throw new BadRequestException("File size exceeds the maximum allowed limit of 10MB");
        }
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new BadRequestException("Unable to determine file type");
        }
        boolean isAllowed = Arrays.asList(
                "image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf",
                "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "text/plain"
        ).contains(contentType.toLowerCase());

        if (!isAllowed) {
            throw new BadRequestException("File type not allowed. Allowed types: Image (JPEG, PNG, GIF, WebP), PDF, Word Document (DOC, DOCX)");
        }
    }

    private String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf(".");
        return (dotIndex >= 0) ? filename.substring(dotIndex + 1).toLowerCase() : "bin";
    }
}
