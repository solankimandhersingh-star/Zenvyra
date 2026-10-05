package com.zenvyra.zenvyainvoiceservice.controller;


import com.zenvyra.zenvyainvoiceservice.dto.CreateInvoiceRequest;
import com.zenvyra.zenvyainvoiceservice.dto.InvoiceResponse;
import com.zenvyra.zenvyainvoiceservice.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'ORG_USER')")
    public ResponseEntity<InvoiceResponse> createInvoice(
            @Valid @RequestBody CreateInvoiceRequest request,
            @RequestHeader(
                    value = "X-Organization-Id",
                    required = false
            ) String selectedOrganizationId
    ) {

        InvoiceResponse response =
                invoiceService.createInvoice(
                        request,
                        selectedOrganizationId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'ORG_USER', 'SUPER_ADMIN')")
    public ResponseEntity<List<InvoiceResponse>> getInvoices(
            @RequestHeader(
                    value = "X-Organization-Id",
                    required = false
            ) String selectedOrganizationId
    ) {

        return ResponseEntity.ok(
                invoiceService.getInvoices(
                        selectedOrganizationId
                )
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'ORG_USER', 'SUPER_ADMIN')")
    public ResponseEntity<InvoiceResponse> getInvoice(
            @PathVariable UUID id,
            @RequestHeader(
                    value = "X-Organization-Id",
                    required = false
            ) String selectedOrganizationId
    ) {

        return ResponseEntity.ok(
                invoiceService.getInvoice(
                        id,
                        selectedOrganizationId
                )
        );
    }
}
