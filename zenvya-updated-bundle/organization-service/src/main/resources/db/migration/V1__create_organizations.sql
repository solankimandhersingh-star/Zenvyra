CREATE TABLE organizations (
                               id BINARY(16) NOT NULL,

                               organization_code VARCHAR(50) NOT NULL,
                               name VARCHAR(200) NOT NULL,
                               business_type VARCHAR(100),

                               email VARCHAR(255),
                               mobile VARCHAR(30),

                               address_line1 VARCHAR(255),
                               address_line2 VARCHAR(255),
                               city VARCHAR(100),
                               state VARCHAR(100),
                               country VARCHAR(100),
                               postal_code VARCHAR(20),

                               tax_number VARCHAR(100),
                               logo_url VARCHAR(500),

                               status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

                               created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                               PRIMARY KEY (id),

                               CONSTRAINT uk_organizations_code
                                   UNIQUE (organization_code),

                               CONSTRAINT chk_organizations_status
                                   CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'CANCELLED'))
);

CREATE INDEX idx_organizations_status
    ON organizations(status);