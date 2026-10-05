package com.zenvyra.zenvyra_user_service.user;

import com.zenvyra.zenvyra_user_service.security.JwtService;
import com.zenvyra.zenvyra_user_service.security.CurrentUser;
import com.zenvyra.zenvyra_user_service.session.UserSessionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final UserSessionService userSessionService;
    private final JwtService jwtService;

    public UserController(UserService userService, UserSessionService userSessionService, JwtService jwtService) {
        this.userService = userService;
        this.userSessionService = userSessionService;
        this.jwtService = jwtService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public UserResponse createUser(@Valid @RequestBody UserCreateRequest request) {
        return userService.createUser(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody UserLoginRequest request) {
        return userService.login(request);
    }

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser() {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", CurrentUser.getUserId());
        response.put("organizationId", CurrentUser.getOrganizationId());
        response.put("username", CurrentUser.getUsername());
        response.put("role", CurrentUser.getRole());
        return response;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'SUPER_ADMIN')")
    public List<UserResponse> getUsers(
            @RequestHeader(
                    value = "X-Organization-Id",
                    required = false
            ) String selectedOrganizationId) {

        return userService.getUsersForCurrentOrganization(
                selectedOrganizationId
        );
    }

    @PostMapping("/refresh")
    public LoginResponse refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return userService.refreshAccessToken(request.getRefreshToken());
    }

    @PostMapping("/bootstrap-super-admin")
    public UserResponse bootstrapSuperAdmin(@Valid @RequestBody SuperAdminCreateRequest request) {
        return userService.createSuperAdmin(request);
    }

    @PostMapping("/internal/admins")
    public UserResponse createOrganizationAdmin(
            @RequestHeader("X-Internal-Service-Key") String serviceKey,
            @Valid @RequestBody AdminCreateRequest request,
            @Value("${internal.service.api-key}") String configuredKey) {

        if (!MessageDigest.isEqual(
                serviceKey.getBytes(StandardCharsets.UTF_8),
                configuredKey.getBytes(StandardCharsets.UTF_8))) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Invalid internal service key");
        }
        return userService.createAdmin(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public UserResponse updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request) {

        return userService.updateUser(id, request);
    }


    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public UserResponse updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UserStatusUpdateRequest request) {

        return userService.updateUserStatus(id, request);
    }


    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public UserResponse resetPassword(
            @PathVariable UUID id,
            @Valid @RequestBody UserResetPasswordRequest request) {

        return userService.resetPassword(id, request);
    }

}
