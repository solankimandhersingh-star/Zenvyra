package com.zenvyra.zenvyra_user_service.organization;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class OrganizationClient {

    private final RestClient restClient;
    private final String apiKey;

    public OrganizationClient(
            @Value("${organization-service.base-url:http://localhost:8082}")
            String baseUrl,
            @Value("${internal.service.api-key}")
            String apiKey) {

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();

        this.apiKey = apiKey;
    }

    public OrganizationLookupResponse findByCode(
            String organizationCode) {

        try {
            return restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(
                                    "/api/organizations/internal/by-code/{code}"
                            )
                            .build(
                                    organizationCode
                                            .trim()
                                            .toUpperCase()
                            ))
                    .header(
                            "X-Internal-Service-Key",
                            apiKey
                    )
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(OrganizationLookupResponse.class);

        } catch (RestClientException ex) {
            throw new IllegalArgumentException(
                    "Invalid organization code"
            );
        }
    }
}