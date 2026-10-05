package com.zenvyra.zenvyra_user_service.user;

import jakarta.validation.constraints.NotBlank;

public class UserStatusUpdateRequest {

    @NotBlank
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
