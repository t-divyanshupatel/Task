INSERT INTO jobs (payload, status) VALUES
    ('{"task": "uppercase", "text": "hello from seed"}', 'pending'),
    ('{"task": "reverse", "text": "docker stack"}', 'pending'),
    ('{"task": "uppercase", "text": "already done"}', 'completed');

UPDATE jobs
SET result = '{"output": "ALREADY DONE"}'::jsonb
WHERE payload->>'text' = 'already done';
