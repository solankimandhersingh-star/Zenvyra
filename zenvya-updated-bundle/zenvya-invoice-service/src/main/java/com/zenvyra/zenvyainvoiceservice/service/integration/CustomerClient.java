package com.zenvyra.zenvyainvoiceservice.service.integration;

import com.zenvyra.zenvyainvoiceservice.execption.BadRequestException;
import com.zenvyra.zenvyainvoiceservice.execption.ResourceNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.UUID;

@Component
public class CustomerClient {

    private final RestClient restClient;

    public CustomerClient(RestClient.Builder builder, ServiceUrlConfig urls) {
        this.restClient = builder.baseUrl(urls.customerUrl()).build();
    }

    public CustomerData getCustomer(UUID customerId, String organizationId) {
        try {
            return restClient.get()
                    .uri("/api/customers/{id}", customerId)
                    .header("X-Organization-Id", organizationId)
                    .retrieve()
                    .body(CustomerData.class);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().value() == 404) {
                throw new ResourceNotFoundException("Customer not found: " + customerId);
            }
            if (ex.getStatusCode().is4xxClientError()) {
                throw new BadRequestException("Unable to access customer: " + customerId);
            }
            throw new BadRequestException("Customer service is unavailable");
        }
    }

    public record CustomerData(
            UUID id,
            UUID organizationId,
            String customerCode,
            String name,
            String email,
            String mobile,
            String taxNumber,
            String billingAddress,
            String shippingAddress,
            String status
    ) {}
}
