-- V4: Add form_submissions table for contact form inbox feature
CREATE TABLE form_submissions
(
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_node_id VARCHAR(255)             NOT NULL,
    project_id   UUID                     NOT NULL,
    page_id      UUID,
    name         VARCHAR(200)             NOT NULL,
    email        VARCHAR(200)             NOT NULL,
    message      VARCHAR(4000),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_form_submissions_project   ON form_submissions (project_id);
CREATE INDEX idx_form_submissions_form_node ON form_submissions (form_node_id);
