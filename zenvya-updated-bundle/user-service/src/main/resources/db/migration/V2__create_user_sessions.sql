CREATE TABLE user_sessions (
                               id BINARY(16) NOT NULL,
                               user_id BINARY(16) NOT NULL,
                               organization_id BINARY(16) NOT NULL,

                               refresh_token_hash VARCHAR(255) NOT NULL,

                               device_id VARCHAR(255),
                               device_name VARCHAR(255),
                               ip_address VARCHAR(45),
                               user_agent VARCHAR(1000),

                               created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               last_used_at TIMESTAMP NULL,
                               expires_at TIMESTAMP NOT NULL,
                               revoked_at TIMESTAMP NULL,

                               status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

                               PRIMARY KEY (id),

                               CONSTRAINT uk_user_sessions_refresh_token_hash
                                   UNIQUE (refresh_token_hash),

                               CONSTRAINT chk_user_sessions_status
                                   CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED'))
);

CREATE INDEX idx_user_sessions_user
    ON user_sessions(user_id);

CREATE INDEX idx_user_sessions_organization
    ON user_sessions(organization_id);

CREATE INDEX idx_user_sessions_status
    ON user_sessions(status);

CREATE INDEX idx_user_sessions_expires_at
    ON user_sessions(expires_at);