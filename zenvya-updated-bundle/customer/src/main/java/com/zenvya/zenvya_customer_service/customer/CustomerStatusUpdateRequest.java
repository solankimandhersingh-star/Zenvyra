package com.zenvya.zenvya_customer_service.customer;

import jakarta.validation.constraints.NotBlank;

public class CustomerStatusUpdateRequest {
    @NotBlank private String status;
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
