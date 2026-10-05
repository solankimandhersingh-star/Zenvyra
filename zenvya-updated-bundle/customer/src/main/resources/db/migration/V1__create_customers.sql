CREATE TABLE customers (
                           id BINARY(16) NOT NULL,
                           organization_id BINARY(16) NOT NULL,
                           customer_code VARCHAR(50) NOT NULL,
                           name VARCHAR(200) NOT NULL,
                           email VARCHAR(255),
                           mobile VARCHAR(30),
                           tax_number VARCHAR(100),
                           billing_address VARCHAR(1000),
                           shipping_address VARCHAR(1000),
                           status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                           created_at DATETIME(6) NOT NULL,
                           updated_at DATETIME(6) NOT NULL,
                           PRIMARY KEY (id),
                           CONSTRAINT uk_customers_org_code UNIQUE (organization_id, customer_code),
                           CONSTRAINT chk_customers_status
                               CHECK (status IN ('ACTIVE', 'DISABLED')),
                           INDEX ix_customers_organization_id (organization_id),
                           INDEX ix_customers_name (organization_id, name)
);