CREATE TABLE users (
                       id BINARY(16) NOT NULL,

                       organization_id BINARY(16) NOT NULL,

                       username VARCHAR(100) NOT NULL,

                       first_name VARCHAR(100) NOT NULL,
                       last_name VARCHAR(100),

                       email VARCHAR(255),
                       mobile VARCHAR(30),

                       password_hash VARCHAR(255) NOT NULL,

                       role VARCHAR(30) NOT NULL DEFAULT 'EMPLOYEE',

                       status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                       PRIMARY KEY (id),

                       CONSTRAINT uk_users_org_username
                           UNIQUE (organization_id, username),

                       CONSTRAINT chk_users_status
                           CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED', 'CANCELLED')),

                       CONSTRAINT chk_users_role
                           CHECK (role IN ('ADMIN', 'EMPLOYEE'))
);

CREATE INDEX idx_users_organization
    ON users(organization_id);

CREATE INDEX idx_users_status
    ON users(status);