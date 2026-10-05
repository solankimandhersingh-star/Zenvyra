package com.zenvyra.zenvyainvoiceservice.dto;

import com.zenvyra.zenvyainvoiceservice.entity.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record InvoiceResponse(

        UUID id,

        UUID organizationId,

        String invoiceNumber,

        LocalDate invoiceDate,

        LocalDate dueDate,

        InvoiceStatus status,

        // Seller
        String sellerName,

        String sellerGstin,

        String sellerAddress,

        String sellerState,

        String sellerStateCode,

        String sellerEmail,

        String sellerMobile,

        // Buyer
        String buyerName,

        String buyerGstin,

        String buyerAddress,

        String buyerState,

        String buyerStateCode,

        String buyerEmail,

        String buyerMobile,

        // Shipping
        String shippingName,

        String shippingAddress,

        String shippingState,

        String shippingStateCode,

        // Supply
        String placeOfSupply,

        String placeOfSupplyCode,

        Boolean reverseCharge,

        // Amounts
        BigDecimal subtotal,

        BigDecimal discountAmount,

        BigDecimal taxableAmount,

        BigDecimal cgstAmount,

        BigDecimal sgstAmount,

        BigDecimal igstAmount,

        BigDecimal roundOff,

        BigDecimal grandTotal,

        String amountInWords,

        // Payment
        String bankName,

        String accountNumber,

        String ifscCode,

        String accountType,

        String bankBranch,

        // Footer
        String termsAndConditions,

        String authorizedSignatoryName,

        List<InvoiceItemResponse> items,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}
