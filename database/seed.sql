-- Sample Seed Data for Task Management System
-- Default User Credentials:
-- Email: admin@test.com
-- Password: 123456

INSERT INTO users (id, name, email, password, created_at, updated_at)
VALUES (
    'usr_admin_001',
    'Admin User',
    'admin@test.com',
    '$2b$10$vK3Nf4K5Z/Yq81c6G1kO9.gWp9mF6Y8vJ4D2L3M4N5O6P7Q8R9S0T', -- Hashed '123456'
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

INSERT INTO tasks (id, user_id, title, description, priority, status, due_date, created_at, updated_at)
VALUES 
(
    'tsk_sample_001',
    'usr_admin_001',
    'Complete Technical Assessment',
    'Develop and submit the full-stack task management application for Koncepthive.',
    'High',
    'In Progress',
    CURRENT_DATE + INTERVAL '1 day',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'tsk_sample_002',
    'usr_admin_001',
    'Review Pull Requests',
    'Review open PRs on GitHub repository and check unit test pass rates.',
    'Medium',
    'Pending',
    CURRENT_DATE + INTERVAL '2 days',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'tsk_sample_003',
    'usr_admin_001',
    'Setup Docker Configuration',
    'Create Dockerfile and docker-compose.yml for easy application containerization.',
    'Low',
    'Completed',
    CURRENT_DATE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
