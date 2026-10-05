package com.zenvyra.zenvyainvoiceservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "invoice_sequences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceSequence {

    @Id
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "next_number", nullable = false)
    private Long nextNumber;
}
