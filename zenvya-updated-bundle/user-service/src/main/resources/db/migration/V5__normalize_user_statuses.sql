ALTER TABLE users
DROP CHECK chk_users_status;

UPDATE users
SET status = 'DISABLED'
WHERE status IN ('INACTIVE', 'LOCKED', 'CANCELLED');

ALTER TABLE users
    ADD CONSTRAINT chk_users_status
        CHECK (status IN ('ACTIVE', 'DISABLED', 'PENDING'));