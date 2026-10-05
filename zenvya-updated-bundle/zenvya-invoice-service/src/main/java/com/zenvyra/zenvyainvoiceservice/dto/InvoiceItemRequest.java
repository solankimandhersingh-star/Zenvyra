package com.zenvyra.zenvyainvoiceservice.dto;

import com.zenvyra.zenvyainvoiceservice.entity.TaxTreatment;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record InvoiceItemRequest(
        @NotNull UUID productId,
        @NotNull @Positive BigDecimal quantity,
        @DecimalMin("0.00") BigDecimal discountAmount,
        @NotNull TaxTreatment taxTreatment,
        // Optional override. If omitted, product default GST rate is used.
        @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal taxRate
) {}
