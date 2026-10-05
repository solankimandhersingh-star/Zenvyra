package com.zenvyra.zenvyainvoiceservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "invoices",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_invoices_org_number",
                        columnNames = {"organization_id", "invoice_number"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(name = "organization_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID organizationId;

    @Column(name = "invoice_number", nullable = false, length = 50)
    private String invoiceNumber;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InvoiceStatus status;

    // =========================
    // Seller Snapshot
    // =========================

    @Column(name = "seller_name", nullable = false, length = 200)
    private String sellerName;

    @Column(name = "seller_gstin", length = 50)
    private String sellerGstin;

    @Column(name = "seller_address", length = 1000)
    private String sellerAddress;

    @Column(name = "seller_state", length = 100)
    private String sellerState;

    @Column(name = "seller_state_code", length = 10)
    private String sellerStateCode;

    @Column(name = "seller_email", length = 255)
    private String sellerEmail;

    @Column(name = "seller_mobile", length = 30)
    private String sellerMobile;

    // =========================
    // Buyer Snapshot
    // =========================

    @Column(name = "buyer_name", nullable = false, length = 200)
    private String buyerName;

    @Column(name = "buyer_gstin", length = 50)
    private String buyerGstin;

    @Column(name = "buyer_address", length = 1000)
    private String buyerAddress;

    @Column(name = "buyer_state", length = 100)
    private String buyerState;

    @Column(name = "buyer_state_code", length = 10)
    private String buyerStateCode;

    @Column(name = "buyer_email", length = 255)
    private String buyerEmail;

    @Column(name = "buyer_mobile", length = 30)
    private String buyerMobile;

    // =========================
    // Shipping Snapshot
    // =========================

    @Column(name = "shipping_name", length = 200)
    private String shippingName;

    @Column(name = "shipping_address", length = 1000)
    private String shippingAddress;

    @Column(name = "shipping_state", length = 100)
    private String shippingState;

    @Column(name = "shipping_state_code", length = 10)
    private String shippingStateCode;

    // =========================
    // GST
    // =========================

    @Column(name = "place_of_supply", length = 100)
    private String placeOfSupply;

    @Column(name = "place_of_supply_code", length = 10)
    private String placeOfSupplyCode;

    @Column(name = "reverse_charge", nullable = false)
    private Boolean reverseCharge;

    // =========================
    // Amounts
    // =========================

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "discount_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "taxable_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxableAmount;

    @Column(name = "cgst_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal cgstAmount;

    @Column(name = "sgst_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal sgstAmount;

    @Column(name = "igst_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal igstAmount;

    @Column(name = "round_off", nullable = false, precision = 15, scale = 2)
    private BigDecimal roundOff;

    @Column(name = "grand_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal grandTotal;

    @Column(name = "amount_in_words", length = 1000)
    private String amountInWords;

    // =========================
    // Payment Snapshot
    // =========================

    @Column(name = "bank_name", length = 200)
    private String bankName;

    @Column(name = "account_number", length = 100)
    private String accountNumber;

    @Column(name = "ifsc_code", length = 50)
    private String ifscCode;

    @Column(name = "account_type", length = 50)
    private String accountType;

    @Column(name = "bank_branch", length = 200)
    private String bankBranch;

    // =========================
    // Presentation
    // =========================

    @Column(name = "terms_and_conditions", length = 3000)
    private String termsAndConditions;

    @Column(name = "authorized_signatory_name", length = 200)
    private String authorizedSignatoryName;

    // =========================
    // Audit
    // =========================

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // =========================
    // Items
    // =========================

    @OneToMany(
            mappedBy = "invoice",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("lineNumber ASC")
    @Builder.Default
    private List<InvoiceItem> items = new ArrayList<>();
}
