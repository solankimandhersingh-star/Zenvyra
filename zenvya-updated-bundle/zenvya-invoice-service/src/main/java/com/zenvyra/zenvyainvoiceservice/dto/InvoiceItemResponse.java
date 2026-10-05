package com.zenvyra.zenvyainvoiceservice.dto;


import com.zenvyra.zenvyainvoiceservice.entity.TaxTreatment;

import java.math.BigDecimal;
import java.util.UUID;

public record InvoiceItemResponse(

        UUID id,

        Integer lineNumber,

        UUID productId,

        String productCode,

        String productName,

        String description,

        String hsnSac,

        BigDecimal quantity,

        String unit,

        BigDecimal unitPrice,

        BigDecimal discountAmount,

        BigDecimal taxableValue,

        TaxTreatment taxTreatment,

        BigDecimal taxRate,

        BigDecimal cgstRate,

        BigDecimal cgstAmount,

        BigDecimal sgstRate,

        BigDecimal sgstAmount,

        BigDecimal igstRate,

        BigDecimal igstAmount,

        BigDecimal totalAmount

) {
}
