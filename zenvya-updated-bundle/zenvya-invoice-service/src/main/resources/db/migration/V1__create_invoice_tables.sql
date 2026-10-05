CREATE TABLE invoice_sequences (
                                   organization_id BINARY(16) NOT NULL,
                                   next_number BIGINT NOT NULL DEFAULT 1,
                                   PRIMARY KEY (organization_id)
);

CREATE TABLE invoices (
                          id BINARY(16) NOT NULL,
                          organization_id BINARY(16) NOT NULL,

                          invoice_number VARCHAR(50) NOT NULL,

                          invoice_date DATE NOT NULL,
                          due_date DATE,

                          status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    -- Seller snapshot
                          seller_name VARCHAR(200) NOT NULL,
                          seller_gstin VARCHAR(50),
                          seller_address VARCHAR(1000),
                          seller_state VARCHAR(100),
                          seller_state_code VARCHAR(10),
                          seller_email VARCHAR(255),
                          seller_mobile VARCHAR(30),

    -- Buyer snapshot
                          buyer_name VARCHAR(200) NOT NULL,
                          buyer_gstin VARCHAR(50),
                          buyer_address VARCHAR(1000),
                          buyer_state VARCHAR(100),
                          buyer_state_code VARCHAR(10),
                          buyer_email VARCHAR(255),
                          buyer_mobile VARCHAR(30),

    -- Shipping snapshot
                          shipping_name VARCHAR(200),
                          shipping_address VARCHAR(1000),
                          shipping_state VARCHAR(100),
                          shipping_state_code VARCHAR(10),

    -- GST information
                          place_of_supply VARCHAR(100),
                          place_of_supply_code VARCHAR(10),
                          reverse_charge BOOLEAN NOT NULL DEFAULT FALSE,

    -- Amounts
                          subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
                          discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
                          taxable_amount DECIMAL(15,2) NOT NULL DEFAULT 0,

                          cgst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
                          sgst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
                          igst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,

                          round_off DECIMAL(15,2) NOT NULL DEFAULT 0,
                          grand_total DECIMAL(15,2) NOT NULL DEFAULT 0,

                          amount_in_words VARCHAR(1000),

    -- Payment snapshot
                          bank_name VARCHAR(200),
                          account_number VARCHAR(100),
                          ifsc_code VARCHAR(50),
                          account_type VARCHAR(50),
                          bank_branch VARCHAR(200),

    -- Presentation
                          terms_and_conditions VARCHAR(3000),
                          authorized_signatory_name VARCHAR(200),

                          created_at DATETIME(6) NOT NULL,
                          updated_at DATETIME(6) NOT NULL,

                          PRIMARY KEY (id),

                          CONSTRAINT uk_invoices_org_number
                              UNIQUE (organization_id, invoice_number),

                          CONSTRAINT chk_invoices_status
                              CHECK (
                                  status IN (
                                             'DRAFT',
                                             'ISSUED',
                                             'PARTIALLY_PAID',
                                             'PAID',
                                             'OVERDUE',
                                             'CANCELLED'
                                      )
                                  ),

                          INDEX ix_invoices_organization_id
                              (organization_id),

                          INDEX ix_invoices_status
                              (organization_id, status),

                          INDEX ix_invoices_date
                              (organization_id, invoice_date)
);

CREATE TABLE invoice_items (
                               id BINARY(16) NOT NULL,

                               invoice_id BINARY(16) NOT NULL,

                               line_number INT NOT NULL,

    -- Product snapshot
                               product_id BINARY(16),
                               product_code VARCHAR(50),
                               product_name VARCHAR(200) NOT NULL,
                               description VARCHAR(1000),

                               hsn_sac VARCHAR(50),

                               quantity DECIMAL(15,3) NOT NULL,
                               unit VARCHAR(30) NOT NULL,

                               unit_price DECIMAL(15,2) NOT NULL,

                               discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,

                               taxable_value DECIMAL(15,2) NOT NULL DEFAULT 0,

    -- Final GST model
                               tax_treatment VARCHAR(20) NOT NULL DEFAULT 'NONE',
                               tax_rate DECIMAL(7,3) NOT NULL DEFAULT 0,

                               cgst_rate DECIMAL(7,3) NOT NULL DEFAULT 0,
                               cgst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,

                               sgst_rate DECIMAL(7,3) NOT NULL DEFAULT 0,
                               sgst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,

                               igst_rate DECIMAL(7,3) NOT NULL DEFAULT 0,
                               igst_amount DECIMAL(15,2) NOT NULL DEFAULT 0,

                               total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,

                               PRIMARY KEY (id),

                               CONSTRAINT fk_invoice_items_invoice
                                   FOREIGN KEY (invoice_id)
                                       REFERENCES invoices(id)
                                       ON DELETE CASCADE,

                               CONSTRAINT uk_invoice_item_line
                                   UNIQUE (invoice_id, line_number),

                               CONSTRAINT chk_invoice_item_tax_treatment
                                   CHECK (
                                       tax_treatment IN (
                                                         'NONE',
                                                         'GST_INCLUDED',
                                                         'GST_EXTRA'
                                           )
                                       ),

                               CONSTRAINT chk_invoice_item_tax_rate
                                   CHECK (
                                       tax_rate >= 0 AND tax_rate <= 100
                                       ),

                               INDEX ix_invoice_items_invoice
                                   (invoice_id),

                               INDEX ix_invoice_items_product
                                   (product_id)
);