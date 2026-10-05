ALTER TABLE organizations
DROP CHECK chk_organizations_status;

UPDATE organizations
SET status = 'DISABLED'
WHERE status IN ('SUSPENDED', 'CANCELLED');

ALTER TABLE organizations
    ADD CONSTRAINT chk_organizations_status
        CHECK (status IN ('PENDING', 'ACTIVE', 'REJECTED', 'DISABLED'));