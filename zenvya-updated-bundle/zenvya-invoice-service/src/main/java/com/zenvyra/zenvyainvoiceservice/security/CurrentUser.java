package com.zenvyra.zenvyainvoiceservice.security;

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

        if (authentication == null
                || !(authentication.getPrincipal() instanceof Jwt)) {

            throw new IllegalStateException(
                    "Authenticated JWT is required"
            );
        }

        return (Jwt) authentication.getPrincipal();
    }

    public static UUID getOrganizationId() {

        Jwt token = jwt();

        String organizationId =
                token.getClaimAsString("organizationId");

        if (organizationId == null
                || organizationId.isBlank()) {

            throw new IllegalStateException(
                    "Organization ID is missing from access token"
            );
        }

        return UUID.fromString(organizationId);
    }

    public static UUID getOrganizationId(
            String selectedOrganizationId
    ) {

        Jwt token = jwt();

        String role =
                token.getClaimAsString("role");

        /*
         * SUPER_ADMIN works inside a selected organization
         * workspace. The selected organization comes from
         * X-Organization-Id.
         */
        if ("SUPER_ADMIN".equals(role)) {

            if (selectedOrganizationId == null
                    || selectedOrganizationId.isBlank()) {

                throw new IllegalStateException(
                        "Organization ID is required for Super Admin"
                );
            }

            return UUID.fromString(selectedOrganizationId);
        }

        /*
         * ORG_ADMIN / ORG_USER must always use the organization
         * from their JWT. They cannot switch organizations by
         * sending X-Organization-Id.
         */
        return getOrganizationId();
    }
}
