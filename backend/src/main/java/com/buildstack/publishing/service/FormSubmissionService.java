package com.buildstack.publishing.service;

import com.buildstack.publishing.dto.FormSubmissionRequest;
import com.buildstack.publishing.dto.FormSubmissionResponse;
import com.buildstack.publishing.entity.FormSubmission;
import com.buildstack.publishing.repository.FormSubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FormSubmissionService {

    private final FormSubmissionRepository formSubmissionRepository;

    /**
     * Save a new form submission from a published page.
     * This is called by the public endpoint — no authentication required.
     */
    @Transactional
    public FormSubmissionResponse submit(String formNodeId, UUID projectId, UUID pageId, FormSubmissionRequest request) {
        FormSubmission submission = FormSubmission.builder()
                .formNodeId(formNodeId)
                .projectId(projectId)
                .pageId(pageId)
                .name(request.getName())
                .email(request.getEmail())
                .message(request.getMessage())
                .build();

        FormSubmission saved = formSubmissionRepository.save(submission);
        log.info("Form submission received: formNodeId={}, email={}", formNodeId, request.getEmail());
        return toResponse(saved);
    }

    /**
     * Get paginated submissions for a project (for the dashboard inbox).
     */
    @Transactional(readOnly = true)
    public Page<FormSubmissionResponse> getSubmissionsForProject(UUID projectId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return formSubmissionRepository
                .findByProjectIdOrderBySubmittedAtDesc(projectId, pageable)
                .map(this::toResponse);
    }

    /**
     * Get all submissions as CSV content.
     */
    @Transactional(readOnly = true)
    public String exportAsCsv(UUID projectId) {
        List<FormSubmission> submissions = formSubmissionRepository.findByProjectIdOrderBySubmittedAtDesc(projectId);

        StringBuilder csv = new StringBuilder();
        csv.append("ID,Name,Email,Message,Submitted At\n");
        for (FormSubmission s : submissions) {
            csv.append(escapeCsv(s.getId().toString())).append(",")
               .append(escapeCsv(s.getName())).append(",")
               .append(escapeCsv(s.getEmail())).append(",")
               .append(escapeCsv(s.getMessage() != null ? s.getMessage() : "")).append(",")
               .append(s.getSubmittedAt() != null ? s.getSubmittedAt().toString() : "")
               .append("\n");
        }
        return csv.toString();
    }

    /**
     * Get total count of submissions for a project.
     */
    @Transactional(readOnly = true)
    public long countSubmissions(UUID projectId) {
        return formSubmissionRepository.countByProjectId(projectId);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        // Wrap in quotes and escape internal quotes
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private FormSubmissionResponse toResponse(FormSubmission s) {
        return FormSubmissionResponse.builder()
                .id(s.getId())
                .formNodeId(s.getFormNodeId())
                .projectId(s.getProjectId())
                .pageId(s.getPageId())
                .name(s.getName())
                .email(s.getEmail())
                .message(s.getMessage())
                .submittedAt(s.getSubmittedAt())
                .build();
    }
}
