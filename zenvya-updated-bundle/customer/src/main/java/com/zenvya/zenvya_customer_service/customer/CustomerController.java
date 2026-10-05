package com.zenvya.zenvya_customer_service.customer;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerService service;

    public CustomerController(CustomerService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public CustomerResponse create(@Valid @RequestBody CustomerCreateRequest request) { return service.create(request); }

    @GetMapping
    public List<CustomerResponse> getAll(
            @RequestParam(required = false) String search,
            @RequestHeader(value = "X-Organization-Id", required = false)
            String selectedOrganizationId) {

        return service.getAll(
                search,
                selectedOrganizationId
        );
    }

    @GetMapping("/{id}")
    public CustomerResponse getById(@PathVariable UUID id) { return service.getById(id); }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public CustomerResponse update(@PathVariable UUID id, @Valid @RequestBody CustomerUpdateRequest request) { return service.update(id, request); }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public CustomerResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody CustomerStatusUpdateRequest request) { return service.updateStatus(id, request); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public void delete(@PathVariable UUID id) { service.delete(id); }
}
