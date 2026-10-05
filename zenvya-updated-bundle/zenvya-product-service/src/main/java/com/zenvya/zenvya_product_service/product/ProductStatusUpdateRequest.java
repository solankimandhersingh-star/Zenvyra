package com.zenvya.zenvya_product_service.product;
import jakarta.validation.constraints.*;
public record ProductStatusUpdateRequest(@NotBlank @Pattern(regexp="ACTIVE|DISABLED") String status){}
