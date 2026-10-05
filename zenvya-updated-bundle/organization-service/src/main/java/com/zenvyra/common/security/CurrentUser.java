package com.zenvyra.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.UUID;

public final class CurrentUser {
    private CurrentUser() {}
    private static Jwt jwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new IllegalStateException("Authenticated user not found");
        }
        return jwt;
    }
    public static UUID userId() { return UUID.fromString(jwt().getSubject()); }
    public static UUID organizationId() {
        String value = jwt().getClaimAsString("organizationId");
        return value == null ? null : UUID.fromString(value);
    }
    public static String role() { return jwt().getClaimAsString("role"); }
}
