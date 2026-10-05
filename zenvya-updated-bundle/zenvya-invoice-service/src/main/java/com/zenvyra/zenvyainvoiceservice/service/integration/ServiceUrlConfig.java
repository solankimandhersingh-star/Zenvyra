package com.zenvyra.zenvyainvoiceservice.service.integration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "zenvya.services")
public record ServiceUrlConfig(
        String organizationUrl,
        String customerUrl,
        String productUrl
) {}
