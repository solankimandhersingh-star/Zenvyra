package com.zenvyra.zenvyainvoiceservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateInvoiceRequest(
        @NotNull LocalDate invoiceDate,
        LocalDate dueDate,

        @NotNull UUID customerId,

        // Optional shipping override. If omitted, customer shipping/billing data is used.
        String shippingName,
        String shippingAddress,
        String shippingState,
        String shippingStateCode,

        // GST / supply information
        String placeOfSupply,
        String placeOfSupplyCode,
        Boolean reverseCharge,

        // Payment information - snapshot on invoice
        String bankName,
        String accountNumber,
        String ifscCode,
        String accountType,
        String bankBranch,

        // Invoice footer - snapshot on invoice
        String termsAndConditions,
        String authorizedSignatoryName,

        @NotEmpty List<@Valid InvoiceItemRequest> items
) {}
