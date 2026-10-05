package com.zenvya.zenvya_customer_service.customer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository
        extends JpaRepository<Customer, UUID> {

    Optional<Customer> findByIdAndOrganizationId(
            UUID id,
            UUID organizationId
    );

    List<Customer> findAllByOrganizationIdOrderByNameAsc(
            UUID organizationId
    );

    List<Customer>
    findAllByOrganizationIdAndNameContainingIgnoreCaseOrderByNameAsc(
            UUID organizationId,
            String name
    );

    Optional<Customer> findTopByOrganizationIdOrderByCustomerCodeDesc(
            UUID organizationId
    );
}