package com.zenvyra.zenvyainvoiceservice.service.integration;

import com.zenvyra.zenvyainvoiceservice.execption.BadRequestException;
import com.zenvyra.zenvyainvoiceservice.execption.ResourceNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class ProductClient {

    private final RestClient restClient;

    public ProductClient(RestClient.Builder builder, ServiceUrlConfig urls) {
        this.restClient = builder.baseUrl(urls.productUrl()).build();
    }

    public ProductData getProduct(UUID productId, String organizationId) {
        try {
            return restClient.get()
                    .uri("/api/products/{id}", productId)
                    .header("X-Organization-Id", organizationId)
                    .retrieve()
                    .body(ProductData.class);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().value() == 404) {
                throw new ResourceNotFoundException("Product not found: " + productId);
            }
            if (ex.getStatusCode().is4xxClientError()) {
                throw new BadRequestException("Unable to access product: " + productId);
            }
            throw new BadRequestException("Product service is unavailable");
        }
    }

    public record ProductData(
            UUID id,
            UUID organizationId,
            String productCode,
            String name,
            String description,
            String category,
            String unit,
            BigDecimal sellingPrice,
            BigDecimal taxRate,
            String status
    ) {}
}
