package com.zenvyra.organization.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class OrganizationApprovalRequest {
    @NotNull
    @Valid
    private OrganizationAdminRequest admin;

    public OrganizationAdminRequest getAdmin() { return admin; }
    public void setAdmin(OrganizationAdminRequest admin) { this.admin = admin; }
}
