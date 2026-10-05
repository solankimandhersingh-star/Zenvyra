package com.zenvyra.zenvyra_user_service.user;

import com.zenvyra.zenvyra_user_service.exception.DuplicateResourceException;
import com.zenvyra.zenvyra_user_service.security.CurrentUser;
import com.zenvyra.zenvyra_user_service.session.UserSession;
import com.zenvyra.zenvyra_user_service.session.UserSessionService;
import com.zenvyra.zenvyra_user_service.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zenvyra.zenvyra_user_service.organization.OrganizationClient;
import com.zenvyra.zenvyra_user_service.organization.OrganizationLookupResponse;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserSessionService userSessionService;
    private final OrganizationClient organizationClient;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserSessionService userSessionService,
            OrganizationClient organizationClient) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userSessionService = userSessionService;
        this.organizationClient = organizationClient;
    }

    public UserResponse createUser(UserCreateRequest request) {
        requireRole("ORG_ADMIN");
        UUID organizationId = CurrentUser.getOrganizationId();
        if (userRepository.existsByOrganizationIdAndUsername(organizationId, request.getUsername())) {
            throw new DuplicateResourceException("Username already exists for this organization");
        }
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setOrganizationId(organizationId);
        user.setUsername(request.getUsername());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setMobile(request.getMobile());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("ORG_USER");
        user.setStatus("ACTIVE");
        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public LoginResponse login(UserLoginRequest request) {

        User user;

        /*
         * SUPER_ADMIN
         *
         * Organization Code is not required.
         */
        if (request.getOrganizationCode() == null
                || request.getOrganizationCode().isBlank()) {

            user = userRepository
                    .findByUsernameAndRole(
                            request.getUsername(),
                            "SUPER_ADMIN"
                    )
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Invalid username or password"
                            )
                    );

        } else {

            /*
             * ORG_ADMIN / ORG_USER
             *
             * Convert organization code into
             * the internal organization UUID.
             */
            OrganizationLookupResponse organization =
                    organizationClient.findByCode(
                            request.getOrganizationCode()
                    );

            /*
             * Only ACTIVE organizations can login.
             */
            if (!"ACTIVE".equals(organization.getStatus())) {

                throw new IllegalArgumentException(
                        "Organization is not active"
                );
            }

            /*
             * Find the user inside that organization.
             */
            user = userRepository
                    .findByOrganizationIdAndUsername(
                            organization.getId(),
                            request.getUsername()
                    )
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Invalid username or password"
                            )
                    );

            /*
             * Extra organization isolation check.
             */
            if (!organization.getId()
                    .equals(user.getOrganizationId())) {

                throw new IllegalArgumentException(
                        "Invalid username or password"
                );
            }
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {

            throw new IllegalArgumentException(
                    "Invalid username or password"
            );
        }

        if (!"ACTIVE".equals(user.getStatus())) {

            throw new IllegalArgumentException(
                    "User account is not active"
            );
        }

        String accessToken =
                jwtService.generateAccessToken(
                        user.getId(),
                        user.getOrganizationId(),
                        user.getUsername(),
                        user.getRole()
                );

        String refreshToken =
                userSessionService.createSession(user);

        LoginResponse response = new LoginResponse();

        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setTokenType("Bearer");
        response.setExpiresIn(900);
        response.setUser(toUserResponse(user));

        return response;
    }

    public List<UserResponse> getUsersForCurrentOrganization(
            String selectedOrganizationId){

        UUID organizationId =
                CurrentUser.getOrganizationId(selectedOrganizationId);
        requireAnyRole("ORG_ADMIN", "SUPER_ADMIN");
        return userRepository.findAllByOrganizationId(organizationId)
                .stream().map(this::toUserResponse).toList();
    }

    public UserResponse createAdmin(AdminCreateRequest request) {
        if (userRepository.existsByOrganizationIdAndRole(request.getOrganizationId(), "ORG_ADMIN")) {
            throw new DuplicateResourceException("An organization admin already exists");
        }
        if (userRepository.existsByOrganizationIdAndUsername(
                request.getOrganizationId(), request.getUsername())) {
            throw new DuplicateResourceException("Username already exists in this organization");
        }

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setOrganizationId(request.getOrganizationId());
        user.setUsername(request.getUsername());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setMobile(request.getMobile());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("ORG_ADMIN");
        user.setStatus("ACTIVE");
        return toUserResponse(userRepository.save(user));
    }

    public UserResponse createSuperAdmin(SuperAdminCreateRequest request) {
        if (userRepository.existsByRole("SUPER_ADMIN")) {
            throw new IllegalStateException("Super Admin is already initialized");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already exists");
        }

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setOrganizationId(null);
        user.setUsername(request.getUsername());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setMobile(request.getMobile());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("SUPER_ADMIN");
        user.setStatus("ACTIVE");
        return toUserResponse(userRepository.save(user));
    }

    public LoginResponse refreshAccessToken(String refreshToken) {
        UserSession session = userSessionService.validateRefreshToken(refreshToken);
        User user = userRepository.findById(session.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new IllegalArgumentException("User account is not active");
        }

        String newAccessToken = jwtService.generateAccessToken(
                user.getId(), user.getOrganizationId(), user.getUsername(), user.getRole());
        String newRefreshToken = userSessionService.rotateRefreshToken(session, user);

        LoginResponse response = new LoginResponse();
        response.setAccessToken(newAccessToken);
        response.setRefreshToken(newRefreshToken);
        response.setTokenType("Bearer");
        response.setExpiresIn(900);
        response.setUser(toUserResponse(user));
        return response;
    }

    private void requireRole(String role) {
        if (!role.equals(CurrentUser.getRole())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Insufficient permissions");
        }
    }

    private void requireAnyRole(String... roles) {

        String currentRole = CurrentUser.getRole();

        for (String role : roles) {
            if (role.equals(currentRole)) {
                return;
            }
        }

        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN,
                "Insufficient permissions"
        );
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setOrganizationId(user.getOrganizationId());
        response.setUsername(user.getUsername());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setMobile(user.getMobile());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());
        return response;
    }

    @Transactional
    public UserResponse updateUser(
            UUID userId,
            UserUpdateRequest request) {

        requireRole("ORG_ADMIN");

        UUID organizationId = CurrentUser.getOrganizationId();

        User currentUser = getManagedUser(userId, organizationId);

        preventSelfModification(currentUser);

        currentUser.setFirstName(request.getFirstName());
        currentUser.setLastName(request.getLastName());
        currentUser.setEmail(request.getEmail());
        currentUser.setMobile(request.getMobile());

        return toUserResponse(userRepository.save(currentUser));
    }


    @Transactional
    public UserResponse updateUserStatus(
            UUID userId,
            UserStatusUpdateRequest request) {

        requireRole("ORG_ADMIN");

        UUID organizationId = CurrentUser.getOrganizationId();

        User currentUser = getManagedUser(userId, organizationId);

        preventSelfModification(currentUser);

        String newStatus = request.getStatus();

        if (!"ACTIVE".equals(newStatus)
                && !"DISABLED".equals(newStatus)) {

            throw new IllegalArgumentException(
                    "Status must be ACTIVE or DISABLED"
            );
        }

        if ("DISABLED".equals(newStatus)) {

            currentUser.setStatus("DISABLED");

            userRepository.save(currentUser);

            // Revoke all active refresh sessions
            userSessionService.revokeAllSessionsForUser(userId);

        } else {

            currentUser.setStatus("ACTIVE");

            userRepository.save(currentUser);
        }

        return toUserResponse(currentUser);
    }


    @Transactional
    public UserResponse resetPassword(
            UUID userId,
            UserResetPasswordRequest request) {

        requireRole("ORG_ADMIN");

        UUID organizationId = CurrentUser.getOrganizationId();

        User currentUser = getManagedUser(userId, organizationId);

        preventSelfModification(currentUser);

        currentUser.setPasswordHash(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(currentUser);

        // Force the user to login again
        userSessionService.revokeAllSessionsForUser(userId);

        return toUserResponse(currentUser);
    }


    private User getManagedUser(
            UUID userId,
            UUID organizationId) {

        User user = userRepository
                .findByIdAndOrganizationId(
                        userId,
                        organizationId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found in your organization"
                        )
                );

        /*
         * ORG_ADMIN can manage ORG_USER accounts only.
         *
         * This prevents an ORG_ADMIN from modifying another
         * organization administrator.
         */
        if (!"ORG_USER".equals(user.getRole())) {

            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "Only organization users can be managed"
            );
        }

        return user;
    }


    private void preventSelfModification(User user) {

        if (user.getId().equals(CurrentUser.getUserId())) {

            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "You cannot modify your own account"
            );
        }
    }

}
