package com.zenvyra.organization;

import com.zenvyra.organization.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {
    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrganizationResponse createOrganization(@Valid @RequestBody OrganizationCreateRequest request) {
        return organizationService.createBySuperAdmin(request);
    }

    @PostMapping("/registrations")
    @ResponseStatus(HttpStatus.CREATED)
    public OrganizationResponse register(@Valid @RequestBody OrganizationRegistrationRequest request) {
        return organizationService.register(request);
    }

    @PostMapping("/{id}/approve")
    public OrganizationResponse approve(
            @PathVariable UUID id,
            @Valid @RequestBody OrganizationApprovalRequest request) {
        return organizationService.approve(id, request);
    }

    @PostMapping("/{id}/reject")
    public OrganizationResponse reject(
            @PathVariable UUID id,
            @Valid @RequestBody OrganizationRejectionRequest request) {
        return organizationService.reject(id, request);
    }

    @PatchMapping("/{id}/status")
    public OrganizationResponse setStatus(
            @PathVariable UUID id,
            @RequestParam boolean enabled) {
        return organizationService.setEnabled(id, enabled);
    }

    @GetMapping("/{id}")
    public OrganizationResponse getOrganization(@PathVariable UUID id) {
        return organizationService.getOrganization(id);
    }

    @GetMapping
    public List<OrganizationResponse> getAllOrganizations() {
        return organizationService.getAllOrganizations();
    }

    @PutMapping("/{id}")
    public OrganizationResponse updateOrganization(
            @PathVariable UUID id,
            @Valid @RequestBody OrganizationUpdateRequest request) {
        return organizationService.updateOrganization(id, request);
    }

    @GetMapping("/internal/by-code/{organizationCode}")
    public com.zenvyra.organization.client.OrganizationLookupResponse getInternalByCode(
            @PathVariable String organizationCode,
            @RequestHeader("X-Internal-Service-Key")
            String serviceKey,
            @Value("${internal.service.api-key}")
            String configuredKey) {

        if (!MessageDigest.isEqual(
                serviceKey.getBytes(StandardCharsets.UTF_8),
                configuredKey.getBytes(StandardCharsets.UTF_8))) {

            throw new org.springframework.web.server
                    .ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid internal service key"
            );
        }

        Organization organization =
                organizationService.getEntityByCode(
                        organizationCode
                );

        var response =
                new com.zenvyra.organization.client
                        .OrganizationLookupResponse();

        response.setId(organization.getId());
        response.setOrganizationCode(
                organization.getOrganizationCode()
        );
        response.setStatus(
                organization.getStatus()
        );

        return response;
    }
}
