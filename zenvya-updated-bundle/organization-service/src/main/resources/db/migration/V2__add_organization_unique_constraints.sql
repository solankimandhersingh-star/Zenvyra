ALTER TABLE organizations
    ADD CONSTRAINT uk_organizations_email
        UNIQUE (email);

ALTER TABLE organizations
    ADD CONSTRAINT uk_organizations_mobile
        UNIQUE (mobile);