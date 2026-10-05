package com.zenvyra.zenvyra_user_service.user;

import jakarta.validation.constraints.NotBlank;

public class UserLoginRequest {

    private String organizationCode;

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    public String getOrganizationCode() {
        return organizationCode;
    }

    public void setOrganizationCode(String organizationCode) {
        this.organizationCode = organizationCode;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}