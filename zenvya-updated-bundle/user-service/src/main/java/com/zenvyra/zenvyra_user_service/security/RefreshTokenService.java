package com.zenvyra.zenvyra_user_service.security;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class RefreshTokenService {

    private final SecureRandom secureRandom = new SecureRandom();

    public String generateRefreshToken() {

        byte[] randomBytes = new byte[64];

        secureRandom.nextBytes(randomBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }

    public String hashRefreshToken(String refreshToken) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    refreshToken.getBytes(StandardCharsets.UTF_8)
            );

            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(hash);

        } catch (NoSuchAlgorithmException exception) {

            throw new IllegalStateException(
                    "SHA-256 algorithm not available",
                    exception
            );
        }
    }

    public boolean matches(
            String refreshToken,
            String refreshTokenHash) {

        String calculatedHash =
                hashRefreshToken(refreshToken);

        return MessageDigest.isEqual(
                calculatedHash.getBytes(StandardCharsets.UTF_8),
                refreshTokenHash.getBytes(StandardCharsets.UTF_8)
        );
    }
}