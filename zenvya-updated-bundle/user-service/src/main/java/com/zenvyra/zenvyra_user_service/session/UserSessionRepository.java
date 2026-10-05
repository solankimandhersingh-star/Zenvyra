package com.zenvyra.zenvyra_user_service.session;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserSessionRepository
        extends JpaRepository<UserSession, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<UserSession> findByRefreshTokenHash(String refreshTokenHash);

    List<UserSession> findAllByUserIdAndStatus(
            UUID userId,
            String status
    );
}