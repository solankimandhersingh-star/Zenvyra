package com.zenvyra.zenvyra_user_service.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByOrganizationIdAndUsername(UUID organizationId, String username);
    Optional<User> findByUsernameAndRole(String username, String role);
    boolean existsByOrganizationIdAndUsername(UUID organizationId, String username);
    boolean existsByUsername(String username);
    List<User> findAllByOrganizationId(UUID organizationId);
    boolean existsByOrganizationIdAndRole(UUID organizationId, String role);
    boolean existsByRole(String role);
    Optional<User> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
