package com.zenvyra.zenvyainvoiceservice.service.integration;

import com.zenvyra.zenvyainvoiceservice.execption.BadRequestException;
import com.zenvyra.zenvyainvoiceservice.execption.ResourceNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.UUID;

@Component
public class OrganizationClient {

    private final RestClient restClient;

    public OrganizationClient(RestClient.Builder builder, ServiceUrlConfig urls) {
        this.restClient = builder.baseUrl(urls.organizationUrl()).build();
    }

    public OrganizationData getOrganization(UUID organizationId) {
        try {
            return restClient.get()
                    .uri("/api/organizations/{id}", organizationId)
                    .header("X-Organization-Id", organizationId.toString())
                    .retrieve()
                    .body(OrganizationData.class);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().value() == 404) {
                throw new ResourceNotFoundException("Organization not found: " + organizationId);
            }
            if (ex.getStatusCode().is4xxClientError()) {
                throw new BadRequestException("Unable to access organization: " + organizationId);
            }
            throw new BadRequestException("Organization service is unavailable");
        }
    }

    public record OrganizationData(
            UUID id,
            String name,
            String organizationCode,
            String taxNumber,
            String addressLine1,
            String addressLine2,
            String city,
            String state,
            String stateCode,
            String country,
            String postalCode,
            String email,
            String mobile,
            String status
    ) {}
}
