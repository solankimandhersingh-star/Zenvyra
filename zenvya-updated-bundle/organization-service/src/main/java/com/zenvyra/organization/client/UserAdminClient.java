package com.zenvyra.organization.client;

import com.zenvyra.organization.dto.OrganizationAdminRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Component
public class UserAdminClient {
    private final RestClient restClient;
    private final String apiKey;

    public UserAdminClient(
            @Value("${user-service.base-url:http://localhost:8081}") String baseUrl,
            @Value("${internal.service.api-key}") String apiKey) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    public UserAdminResponse createAdmin(UUID organizationId, OrganizationAdminRequest admin) {
        var request = new java.util.HashMap<String, Object>();
        request.put("organizationId", organizationId);
        request.put("username", admin.getUsername());
        request.put("firstName", admin.getFirstName());
        request.put("lastName", admin.getLastName());
        request.put("email", admin.getEmail());
        request.put("mobile", admin.getMobile());
        request.put("password", admin.getPassword());

        return restClient.post()
                .uri("/api/users/internal/admins")
                .header("X-Internal-Service-Key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(UserAdminResponse.class);
    }
}
