package com.zenvya.zenvya_customer_service.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public final class CurrentUser {

    private CurrentUser() {
    }

    private static Jwt jwt() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !(authentication.getPrincipal() instanceof Jwt jwt)) {

            throw new IllegalStateException(
                    "Authenticated user not found"
            );
        }

        return jwt;
    }

    public static UUID getUserId() {
        return UUID.fromString(jwt().getSubject());
    }

    public static UUID getOrganizationId() {

        String organizationId =
                jwt().getClaimAsString("organizationId");

        if (organizationId == null || organizationId.isBlank()) {
            throw new IllegalStateException(
                    "Organization ID is missing from access token"
            );
        }

        return UUID.fromString(organizationId);
    }

    public static UUID getOrganizationId(String selectedOrganizationId) {

        Jwt token = jwt();

        String role = token.getClaimAsString("role");

        // Super Admin can view a selected organization.
        if ("SUPER_ADMIN".equals(role)) {

            if (selectedOrganizationId == null ||
                    selectedOrganizationId.isBlank()) {
                throw new IllegalStateException(
                        "Organization ID is required for Super Admin"
                );
            }

            return UUID.fromString(selectedOrganizationId);
        }

        // Normal organization users must use the organization
        // from their own JWT.
        String organizationId =
                token.getClaimAsString("organizationId");

        if (organizationId == null || organizationId.isBlank()) {
            throw new IllegalStateException(
                    "Organization ID is missing from access token"
            );
        }

        return UUID.fromString(organizationId);
    }

    public static String getRole() {
        return jwt().getClaimAsString("role");
    }

    public static String getUsername() {
        return jwt().getClaimAsString("username");
    }
}