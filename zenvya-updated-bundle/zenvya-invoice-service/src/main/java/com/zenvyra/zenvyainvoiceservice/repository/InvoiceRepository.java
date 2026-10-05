package com.zenvyra.zenvyainvoiceservice.repository;


import com.zenvyra.zenvyainvoiceservice.entity.Invoice;
import com.zenvyra.zenvyainvoiceservice.entity.InvoiceStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;


public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    List<Invoice> findAllByOrganizationIdOrderByInvoiceDateDesc(
            UUID organizationId
    );

    Optional<Invoice> findByIdAndOrganizationId(
            UUID id,
            UUID organizationId
    );

    Optional<Invoice> findByOrganizationIdAndInvoiceNumber(
            UUID organizationId,
            String invoiceNumber
    );

    List<Invoice> findAllByOrganizationIdAndStatusOrderByInvoiceDateDesc(
            UUID organizationId,
            InvoiceStatus status
    );

    boolean existsByOrganizationIdAndInvoiceNumber(
            UUID organizationId,
            String invoiceNumber
    );
}
