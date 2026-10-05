ALTER TABLE users MODIFY organization_id BINARY(16) NULL;

ALTER TABLE users DROP CHECK chk_users_role;
ALTER TABLE users
    ADD CONSTRAINT chk_users_role
    CHECK (role IN ('SUPER_ADMIN', 'ORG_ADMIN', 'ORG_USER'));

ALTER TABLE users DROP CHECK chk_users_status;
ALTER TABLE users
    ADD CONSTRAINT chk_users_status
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED', 'CANCELLED', 'PENDING'));
