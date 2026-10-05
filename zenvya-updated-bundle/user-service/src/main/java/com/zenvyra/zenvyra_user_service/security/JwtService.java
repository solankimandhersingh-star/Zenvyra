package com.zenvyra.zenvyra_user_service.security;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;

    public JwtService(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    public String generateAccessToken(
            UUID userId,
            UUID organizationId,
            String username,
            String role) {

        Instant now = Instant.now();

        JwtClaimsSet.Builder claimsBuilder = JwtClaimsSet.builder()
                .issuer("zenvyra")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(900))
                .subject(userId.toString())
                .claim("username", username)
                .claim("role", role);

        // Organization is optional for SUPER_ADMIN
        if (organizationId != null) {
            claimsBuilder.claim(
                    "organizationId",
                    organizationId.toString()
            );
        }

        JwtClaimsSet claims = claimsBuilder.build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256)
                .build();

        return jwtEncoder
                .encode(
                        JwtEncoderParameters.from(header, claims)
                )
                .getTokenValue();
    }
}