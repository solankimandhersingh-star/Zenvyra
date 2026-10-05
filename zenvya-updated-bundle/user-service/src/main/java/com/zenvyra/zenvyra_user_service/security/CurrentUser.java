package com.zenvyra.zenvyra_user_service.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public class CurrentUser {

    private CurrentUser() {
    }

    private static Jwt getJwt() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new IllegalStateException("Authenticated user not found");
        }

        return jwt;
    }

    public static UUID getUserId() {
        return UUID.fromString(getJwt().getSubject());
    }

    public static UUID getOrganizationId() {

        String organizationId =
                getJwt().getClaimAsString("organizationId");

        if (organizationId == null || organizationId.isBlank()) {
            return null;
        }

        return UUID.fromString(organizationId);
    }

    public static String getUsername() {
        return getJwt().getClaimAsString("username");
    }

    public static String getRole() {
        return getJwt().getClaimAsString("role");
    }

    public static UUID getOrganizationId(String selectedOrganizationId) {

        Jwt token = getJwt();

        String role = token.getClaimAsString("role");

        if ("SUPER_ADMIN".equals(role)) {

            if (selectedOrganizationId == null ||
                    selectedOrganizationId.isBlank()) {

                throw new IllegalStateException(
                        "Organization ID is required for Super Admin"
                );
            }

            return UUID.fromString(selectedOrganizationId);
        }

        String organizationId =
                token.getClaimAsString("organizationId");

        if (organizationId == null || organizationId.isBlank()) {
            throw new IllegalStateException(
                    "Organization ID is missing from access token"
            );
        }

        return UUID.fromString(organizationId);
    }
}