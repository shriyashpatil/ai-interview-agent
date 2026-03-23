package com.interviewagent.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewagent.dto.ResumeAnalysisResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeService {

    private final ClaudeApiService claudeApiService;
    private final ObjectMapper objectMapper;

    public ResumeAnalysisResponse analyzeResume(MultipartFile file) {
        String resumeText = extractText(file);

        if (resumeText.isBlank()) {
            throw new RuntimeException("Could not extract text from the uploaded file");
        }

        String analysisJson = claudeApiService.analyzeResume(resumeText);

        try {
            return objectMapper.readValue(analysisJson, ResumeAnalysisResponse.class);
        } catch (Exception e) {
            log.error("Failed to parse Claude's resume analysis response: {}", e.getMessage());
            // Return a basic response if JSON parsing fails
            return ResumeAnalysisResponse.builder()
                    .overallAssessment(analysisJson)
                    .build();
        }
    }

    private String extractText(MultipartFile file) {
        String filename = file.getOriginalFilename();

        if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
            return extractFromPdf(file);
        } else {
            // Assume plain text for .txt, .md, etc.
            try {
                return new String(file.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Failed to read file", e);
            }
        }
    }

    private String extractFromPdf(MultipartFile file) {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (IOException e) {
            throw new RuntimeException("Failed to extract text from PDF", e);
        }
    }
}
