package com.zenvyra.organization;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    Optional<Organization> findByOrganizationCode(String organizationCode);

    boolean existsByOrganizationCode(String organizationCode);
    boolean existsByEmail(String email);
    boolean existsByMobile(String mobile);
    boolean existsByName(String name);
}