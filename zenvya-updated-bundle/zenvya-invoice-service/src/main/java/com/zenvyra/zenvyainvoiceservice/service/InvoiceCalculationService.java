package com.zenvyra.zenvyainvoiceservice.service;

import com.zenvyra.zenvyainvoiceservice.entity.TaxTreatment;
import com.zenvyra.zenvyainvoiceservice.execption.BadRequestException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class InvoiceCalculationService {

    private static final int SCALE = 2;

    public CalculatedItem calculateItem(
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal discount,
            TaxTreatment taxTreatment,
            BigDecimal taxRate,
            boolean interstate
    ) {
        BigDecimal safeDiscount = discount == null ? BigDecimal.ZERO : discount;
        BigDecimal safeTaxRate = taxRate == null ? BigDecimal.ZERO : taxRate;

        if (safeDiscount.signum() < 0) {
            throw new BadRequestException("Discount cannot be negative");
        }
        if (safeTaxRate.signum() < 0 || safeTaxRate.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BadRequestException("GST rate must be between 0 and 100");
        }
        if (taxTreatment == null) {
            throw new BadRequestException("Tax treatment is required");
        }

        // WITHOUT GST always means zero GST, irrespective of product default.
        if (taxTreatment == TaxTreatment.NONE) {
            safeTaxRate = BigDecimal.ZERO;
        }

        BigDecimal grossAmount = quantity.multiply(unitPrice).setScale(SCALE, RoundingMode.HALF_UP);
        if (safeDiscount.compareTo(grossAmount) > 0) {
            throw new BadRequestException("Discount cannot be greater than item amount");
        }

        BigDecimal amountAfterDiscount = grossAmount.subtract(safeDiscount).setScale(SCALE, RoundingMode.HALF_UP);
        BigDecimal taxableValue;
        BigDecimal totalTax;

        if (taxTreatment == TaxTreatment.NONE) {
            taxableValue = amountAfterDiscount;
            totalTax = BigDecimal.ZERO.setScale(SCALE);
        } else if (taxTreatment == TaxTreatment.GST_INCLUDED) {
            BigDecimal divisor = BigDecimal.ONE.add(
                    safeTaxRate.divide(BigDecimal.valueOf(100), 12, RoundingMode.HALF_UP));
            taxableValue = amountAfterDiscount.divide(divisor, SCALE, RoundingMode.HALF_UP);
            totalTax = amountAfterDiscount.subtract(taxableValue).setScale(SCALE, RoundingMode.HALF_UP);
        } else {
            taxableValue = amountAfterDiscount;
            totalTax = taxableValue.multiply(safeTaxRate)
                    .divide(BigDecimal.valueOf(100), SCALE, RoundingMode.HALF_UP);
        }

        BigDecimal cgstRate = BigDecimal.ZERO.setScale(3);
        BigDecimal sgstRate = BigDecimal.ZERO.setScale(3);
        BigDecimal igstRate = BigDecimal.ZERO.setScale(3);
        BigDecimal cgstAmount = BigDecimal.ZERO.setScale(SCALE);
        BigDecimal sgstAmount = BigDecimal.ZERO.setScale(SCALE);
        BigDecimal igstAmount = BigDecimal.ZERO.setScale(SCALE);

        if (totalTax.signum() > 0) {
            if (interstate) {
                igstRate = safeTaxRate.setScale(3, RoundingMode.HALF_UP);
                igstAmount = totalTax;
            } else {
                cgstRate = safeTaxRate.divide(BigDecimal.valueOf(2), 3, RoundingMode.HALF_UP);
                sgstRate = cgstRate;
                cgstAmount = totalTax.divide(BigDecimal.valueOf(2), SCALE, RoundingMode.HALF_UP);
                sgstAmount = totalTax.subtract(cgstAmount).setScale(SCALE, RoundingMode.HALF_UP);
            }
        }

        BigDecimal totalAmount = taxTreatment == TaxTreatment.GST_INCLUDED
                ? amountAfterDiscount
                : taxableValue.add(totalTax).setScale(SCALE, RoundingMode.HALF_UP);

        return new CalculatedItem(
                grossAmount,
                safeDiscount.setScale(SCALE, RoundingMode.HALF_UP),
                taxableValue,
                safeTaxRate.setScale(3, RoundingMode.HALF_UP),
                cgstRate,
                cgstAmount,
                sgstRate,
                sgstAmount,
                igstRate,
                igstAmount,
                totalAmount
        );
    }

    public record CalculatedItem(
            BigDecimal grossAmount,
            BigDecimal discountAmount,
            BigDecimal taxableValue,
            BigDecimal taxRate,
            BigDecimal cgstRate,
            BigDecimal cgstAmount,
            BigDecimal sgstRate,
            BigDecimal sgstAmount,
            BigDecimal igstRate,
            BigDecimal igstAmount,
            BigDecimal totalAmount
    ) {}
}
