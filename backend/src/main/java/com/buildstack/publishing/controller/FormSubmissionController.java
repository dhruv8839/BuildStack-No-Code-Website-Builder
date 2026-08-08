package com.buildstack.publishing.controller;

import com.buildstack.publishing.dto.FormSubmissionRequest;
import com.buildstack.publishing.dto.FormSubmissionResponse;
import com.buildstack.publishing.service.FormSubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * Handles form submissions from published BuildStack pages (public endpoint)
 * and provides the authenticated inbox API for project owners.
 */
@RestController
@RequiredArgsConstructor
public class FormSubmissionController {

    private final FormSubmissionService formSubmissionService;

    // ──────────────────────────────────────────────────────────────────────────
    // PUBLIC: receive form submissions from published pages (no auth required)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/v1/published/forms/{formNodeId}/submit
     *
     * Called by the exported site's script.js when a visitor submits a form.
     * Requires projectId as a query parameter so we can associate the submission.
     */
    @PostMapping("/api/v1/published/forms/{formNodeId}/submit")
    public ResponseEntity<FormSubmissionResponse> submitForm(
            @PathVariable String formNodeId,
            @RequestParam UUID projectId,
            @RequestParam(required = false) UUID pageId,
            @Valid @RequestBody FormSubmissionRequest request) {

        FormSubmissionResponse response = formSubmissionService.submit(formNodeId, projectId, pageId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // AUTHENTICATED: inbox & export (project owner only)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/projects/{projectId}/form-submissions?page=0&size=20
     *
     * Returns a paginated list of form submissions for the project dashboard.
     */
    @GetMapping("/api/v1/projects/{projectId}/form-submissions")
    public ResponseEntity<Page<FormSubmissionResponse>> getSubmissions(
            @PathVariable UUID projectId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<FormSubmissionResponse> result = formSubmissionService.getSubmissionsForProject(projectId, page, size);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/v1/projects/{projectId}/form-submissions/export.csv
     *
     * Downloads all submissions as a CSV file.
     */
    @GetMapping("/api/v1/projects/{projectId}/form-submissions/export.csv")
    public ResponseEntity<byte[]> exportCsv(@PathVariable UUID projectId) {
        String csv = formSubmissionService.exportAsCsv(projectId);
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "form-submissions.csv");
        headers.setContentLength(bytes.length);

        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    /**
     * GET /api/v1/projects/{projectId}/form-submissions/count
     *
     * Returns the total count of submissions for quick stats.
     */
    @GetMapping("/api/v1/projects/{projectId}/form-submissions/count")
    public ResponseEntity<Long> countSubmissions(@PathVariable UUID projectId) {
        return ResponseEntity.ok(formSubmissionService.countSubmissions(projectId));
    }
}
