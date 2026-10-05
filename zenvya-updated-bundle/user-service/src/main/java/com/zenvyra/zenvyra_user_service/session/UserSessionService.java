package com.zenvyra.zenvyra_user_service.session;

import com.zenvyra.zenvyra_user_service.security.RefreshTokenService;
import com.zenvyra.zenvyra_user_service.user.User;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserSessionService {

    private final UserSessionRepository userSessionRepository;
    private final RefreshTokenService refreshTokenService;

    public UserSessionService(
            UserSessionRepository userSessionRepository,
            RefreshTokenService refreshTokenService) {

        this.userSessionRepository = userSessionRepository;
        this.refreshTokenService = refreshTokenService;
    }

    public String createSession(User user) {

        String refreshToken =
                refreshTokenService.generateRefreshToken();

        String refreshTokenHash =
                refreshTokenService.hashRefreshToken(refreshToken);

        UserSession session = new UserSession();

        session.setId(UUID.randomUUID());
        session.setUserId(user.getId());
        session.setOrganizationId(user.getOrganizationId());
        session.setRefreshTokenHash(refreshTokenHash);

        session.setCreatedAt(LocalDateTime.now());
        session.setLastUsedAt(LocalDateTime.now());

        session.setExpiresAt(
                LocalDateTime.now().plusDays(30)
        );

        session.setStatus("ACTIVE");

        userSessionRepository.save(session);

        return refreshToken;
    }
    @Transactional
    public UserSession validateRefreshToken(String refreshToken) {

        String refreshTokenHash =
                refreshTokenService.hashRefreshToken(refreshToken);

        UserSession session =
                userSessionRepository
                        .findByRefreshTokenHash(refreshTokenHash)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid refresh token"
                                )
                        );

        if (!"ACTIVE".equals(session.getStatus())) {
            throw new IllegalArgumentException(
                    "Refresh token is no longer active"
            );
        }

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {

            session.setStatus("EXPIRED");

            userSessionRepository.save(session);

            throw new IllegalArgumentException(
                    "Refresh token has expired"
            );
        }

        if (!refreshTokenService.matches(
                refreshToken,
                session.getRefreshTokenHash())) {

            throw new IllegalArgumentException(
                    "Invalid refresh token"
            );
        }

        return session;
    }
    @Transactional
    public String rotateRefreshToken(UserSession oldSession, User user) {

        // Revoke the old session
        oldSession.setStatus("REVOKED");
        oldSession.setRevokedAt(LocalDateTime.now());

        userSessionRepository.save(oldSession);

        // Create a completely new refresh-token session
        return createSession(user);
    }

    @Transactional
    public void revokeAllSessionsForUser(UUID userId) {

        List<UserSession> sessions =
                userSessionRepository.findAllByUserIdAndStatus(
                        userId,
                        "ACTIVE"
                );

        LocalDateTime now = LocalDateTime.now();

        for (UserSession session : sessions) {
            session.setStatus("REVOKED");
            session.setRevokedAt(now);
        }

        userSessionRepository.saveAll(sessions);
    }
}