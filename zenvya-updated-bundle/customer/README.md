# Zenvyra Customer Service

Complete Spring Boot backend for the Customer module.

## Stack
- Java 21
- Spring Boot 4.1.1
- Spring Data JPA / Hibernate
- MySQL 8
- Flyway 12.4.0
- Spring Security Resource Server / JWT

## Port
8083

## API
- POST /api/customers — ORG_ADMIN create
- GET /api/customers — ORG_ADMIN/ORG_USER view/search
- GET /api/customers/{id} — own organization only
- PUT /api/customers/{id} — ORG_ADMIN update
- PATCH /api/customers/{id}/status — ORG_ADMIN ACTIVE/DISABLED
- DELETE /api/customers/{id} — ORG_ADMIN delete

All reads/writes are scoped by the organizationId from the authenticated JWT. The organizationId supplied by the caller is never trusted.

## Before running
1. Create/use MySQL database `zenvya_customer_db` or let MySQL create it.
2. Change `spring.datasource.password` in application.yml.
3. Configure `spring.security.oauth2.resourceserver.jwt.issuer-uri` to match the JWT issuer used by your User Service. If your existing User Service does not expose OIDC discovery at that issuer, copy the same JwtDecoder/public-key configuration used by your other services.
4. Add the gateway route:
   - Path=/api/customers/**
   - uri=http://localhost:8083
