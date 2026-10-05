package com.zenvyra.organization;

import com.zenvyra.common.exception.DuplicateResourceException;
import com.zenvyra.common.security.CurrentUser;
import com.zenvyra.organization.client.UserAdminClient;
import com.zenvyra.organization.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrganizationService {
    private final OrganizationRepository organizationRepository;
    private final UserAdminClient userAdminClient;

    public OrganizationService(OrganizationRepository organizationRepository, UserAdminClient userAdminClient) {
        this.organizationRepository = organizationRepository;
        this.userAdminClient = userAdminClient;
    }

    @Transactional
    public OrganizationResponse createBySuperAdmin(OrganizationCreateRequest request) {
        requireSuperAdmin();
        validateDuplicates(request.getName(), request.getEmail(), request.getMobile());

        Organization organization = buildOrganization(request);
        organization.setStatus("ACTIVE");
        Organization saved = organizationRepository.save(organization);

        try {
            userAdminClient.createAdmin(saved.getId(), requiredAdmin(request));
        } catch (RuntimeException ex) {
            organizationRepository.delete(saved);
            throw new IllegalStateException("Organization was not created because admin creation failed", ex);
        }
        return mapToResponse(saved);
    }

    @Transactional
    public OrganizationResponse register(OrganizationRegistrationRequest request) {
        validateDuplicates(request.getName(), request.getEmail(), request.getMobile());
        Organization organization = new Organization();
        organization.setOrganizationCode("ORG-" + organization.getId().toString().substring(0, 8).toUpperCase());
        organization.setName(request.getName());
        organization.setBusinessType(request.getBusinessType());
        organization.setEmail(request.getEmail());
        organization.setMobile(request.getMobile());
        organization.setAddressLine1(request.getAddressLine1());
        organization.setAddressLine2(request.getAddressLine2());
        organization.setCity(request.getCity());
        organization.setState(request.getState());
        organization.setCountry(request.getCountry());
        organization.setPostalCode(request.getPostalCode());
        organization.setTaxNumber(request.getTaxNumber());
        organization.setLogoUrl(request.getLogoUrl());
        organization.setStatus("PENDING");
        return mapToResponse(organizationRepository.save(organization));
    }

    @Transactional
    public OrganizationResponse approve(UUID id, OrganizationApprovalRequest request) {
        requireSuperAdmin();
        Organization organization = getEntity(id);
        if (!"PENDING".equals(organization.getStatus())) {
            throw new IllegalArgumentException("Only PENDING organizations can be approved");
        }

        try {
            userAdminClient.createAdmin(organization.getId(), request.getAdmin());
        } catch (RuntimeException ex) {
            throw new IllegalStateException("Organization approval failed because admin creation failed", ex);
        }

        organization.setStatus("ACTIVE");
        organization.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(organizationRepository.save(organization));
    }

    @Transactional
    public OrganizationResponse reject(UUID id, OrganizationRejectionRequest request) {
        requireSuperAdmin();
        Organization organization = getEntity(id);
        if (!"PENDING".equals(organization.getStatus())) {
            throw new IllegalArgumentException("Only PENDING organizations can be rejected");
        }
        organization.setStatus("REJECTED");
        organization.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(organizationRepository.save(organization));
    }

    @Transactional
    public OrganizationResponse setEnabled(UUID id, boolean enabled) {
        requireSuperAdmin();
        Organization organization = getEntity(id);
        if (enabled) {
            if ("REJECTED".equals(organization.getStatus())) {
                throw new IllegalArgumentException("A rejected organization must be approved instead of enabled directly");
            }
            organization.setStatus("ACTIVE");
        } else {
            organization.setStatus("DISABLED");
        }
        organization.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(organizationRepository.save(organization));
    }

    public OrganizationResponse getOrganization(UUID id) {
        Organization organization = getEntity(id);
        if (!"SUPER_ADMIN".equals(CurrentUser.role())) {
            if (!"ORG_ADMIN".equals(CurrentUser.role()) || !id.equals(CurrentUser.organizationId())) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.FORBIDDEN, "Insufficient permissions");
            }
        }
        return mapToResponse(organization);
    }

    public List<OrganizationResponse> getAllOrganizations() {
        requireSuperAdmin();
        return organizationRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public OrganizationResponse updateOrganization(UUID id, OrganizationUpdateRequest request) {
        Organization organization = getEntity(id);
        if (!"SUPER_ADMIN".equals(CurrentUser.role())
                && (!"ORG_ADMIN".equals(CurrentUser.role()) || !id.equals(CurrentUser.organizationId()))) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Insufficient permissions");
        }

        if (!organization.getName().equals(request.getName())
                && organizationRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Organization with this name already exists");
        }
        if (request.getEmail() != null && !request.getEmail().equals(organization.getEmail())
                && organizationRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Organization with this email already exists");
        }
        if (request.getMobile() != null && !request.getMobile().equals(organization.getMobile())
                && organizationRepository.existsByMobile(request.getMobile())) {
            throw new DuplicateResourceException("Organization with this mobile number already exists");
        }

        organization.setName(request.getName());
        organization.setBusinessType(request.getBusinessType());
        organization.setEmail(request.getEmail());
        organization.setMobile(request.getMobile());
        organization.setAddressLine1(request.getAddressLine1());
        organization.setAddressLine2(request.getAddressLine2());
        organization.setCity(request.getCity());
        organization.setState(request.getState());
        organization.setCountry(request.getCountry());
        organization.setPostalCode(request.getPostalCode());
        organization.setTaxNumber(request.getTaxNumber());
        organization.setLogoUrl(request.getLogoUrl());
        organization.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(organizationRepository.save(organization));
    }

    private Organization buildOrganization(OrganizationCreateRequest request) {
        Organization organization = new Organization();
        organization.setOrganizationCode("ORG-" + organization.getId().toString().substring(0, 8).toUpperCase());
        organization.setName(request.getName());
        organization.setBusinessType(request.getBusinessType());
        organization.setEmail(request.getEmail());
        organization.setMobile(request.getMobile());
        organization.setAddressLine1(request.getAddressLine1());
        organization.setAddressLine2(request.getAddressLine2());
        organization.setCity(request.getCity());
        organization.setState(request.getState());
        organization.setCountry(request.getCountry());
        organization.setPostalCode(request.getPostalCode());
        organization.setTaxNumber(request.getTaxNumber());
        organization.setLogoUrl(request.getLogoUrl());
        return organization;
    }

    private OrganizationAdminRequest requiredAdmin(OrganizationCreateRequest request) {
        if (request.getAdmin() == null) {
            throw new IllegalArgumentException("Organization admin details are required");
        }
        return request.getAdmin();
    }

    private void validateDuplicates(String name, String email, String mobile) {

        if (name != null && organizationRepository.existsByName(name)) {
            throw new DuplicateResourceException(
                    "Organization with this name already exists");
        }

        if (email != null && organizationRepository.existsByEmail(email)) {
            throw new DuplicateResourceException(
                    "Organization with this email already exists");
        }

        if (mobile != null && organizationRepository.existsByMobile(mobile)) {
            throw new DuplicateResourceException(
                    "Organization with this mobile number already exists");
        }
    }

    private Organization getEntity(UUID id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
    }

    private void requireSuperAdmin() {
        if (!"SUPER_ADMIN".equals(CurrentUser.role())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Super Admin access required");
        }
    }

    private OrganizationResponse mapToResponse(Organization organization) {
        OrganizationResponse response = new OrganizationResponse();
        response.setId(organization.getId());
        response.setOrganizationCode(organization.getOrganizationCode());
        response.setName(organization.getName());
        response.setBusinessType(organization.getBusinessType());
        response.setEmail(organization.getEmail());
        response.setMobile(organization.getMobile());
        response.setAddressLine1(organization.getAddressLine1());
        response.setAddressLine2(organization.getAddressLine2());
        response.setCity(organization.getCity());
        response.setState(organization.getState());
        response.setCountry(organization.getCountry());
        response.setPostalCode(organization.getPostalCode());
        response.setTaxNumber(organization.getTaxNumber());
        response.setLogoUrl(organization.getLogoUrl());
        response.setStatus(organization.getStatus());
        response.setCreatedAt(organization.getCreatedAt());
        response.setUpdatedAt(organization.getUpdatedAt());
        return response;
    }

    public Organization getEntityByCode(String organizationCode) {

        return organizationRepository
                .findByOrganizationCode(
                        organizationCode.trim().toUpperCase()
                )
                .orElseThrow(() ->
                        new org.springframework.web.server
                                .ResponseStatusException(
                                org.springframework.http.HttpStatus.NOT_FOUND,
                                "Organization not found"
                        )
                );
    }
}
