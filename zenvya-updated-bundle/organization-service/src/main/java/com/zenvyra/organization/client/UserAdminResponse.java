package com.zenvyra.organization.client;

import java.util.UUID;

public class UserAdminResponse {
    private UUID id;
    private UUID organizationId;
    private String username;
    private String role;
    public UUID getId(){return id;}
    public void setId(UUID id){this.id=id;}
    public UUID getOrganizationId(){return organizationId;}
    public void setOrganizationId(UUID organizationId){this.organizationId=organizationId;}
    public String getUsername(){return username;}
    public void setUsername(String username){this.username=username;}
    public String getRole(){return role;}
    public void setRole(String role){this.role=role;}
}
