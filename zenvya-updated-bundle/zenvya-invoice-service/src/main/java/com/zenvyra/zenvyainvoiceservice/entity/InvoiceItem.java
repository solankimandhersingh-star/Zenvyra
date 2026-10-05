package com.zenvyra.zenvyainvoiceservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(
        name = "invoice_items",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_invoice_item_line",
                        columnNames = {"invoice_id", "line_number"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItem {

    @Id
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "invoice_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_invoice_items_invoice")
    )
    private Invoice invoice;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    // =========================
    // Product Snapshot
    // =========================

    @Column(name = "product_id", columnDefinition = "BINARY(16)")
    private UUID productId;

    @Column(name = "product_code", length = 50)
    private String productCode;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "hsn_sac", length = 50)
    private String hsnSac;

    // =========================
    // Quantity / Price
    // =========================

    @Column(nullable = false, precision = 15, scale = 3)
    private BigDecimal quantity;

    @Column(nullable = false, length = 30)
    private String unit;

    @Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "discount_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountAmount;

    // =========================
    // Tax
    // =========================

    @Column(name = "taxable_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxableValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "tax_treatment", nullable = false, length = 20)
    private TaxTreatment taxTreatment;

    @Column(name = "tax_rate", nullable = false, precision = 7, scale = 3)
    private BigDecimal taxRate;

    // =========================
    // CGST
    // =========================

    @Column(name = "cgst_rate", nullable = false, precision = 7, scale = 3)
    private BigDecimal cgstRate;

    @Column(name = "cgst_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal cgstAmount;

    // =========================
    // SGST
    // =========================

    @Column(name = "sgst_rate", nullable = false, precision = 7, scale = 3)
    private BigDecimal sgstRate;

    @Column(name = "sgst_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal sgstAmount;

    // =========================
    // IGST
    // =========================

    @Column(name = "igst_rate", nullable = false, precision = 7, scale = 3)
    private BigDecimal igstRate;

    @Column(name = "igst_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal igstAmount;

    // =========================
    // Final
    // =========================

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;
}
