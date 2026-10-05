package com.zenvyra.zenvyainvoiceservice.service.integration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(ServiceUrlConfig.class)
public class AuthenticatedRestClientConfig {

    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder().requestInterceptor((request, body, execution) -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
                request.getHeaders().setBearerAuth(jwt.getTokenValue());
            }
            return execution.execute(request, body);
        });
    }
}
