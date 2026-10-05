# Zenvyra Product Service
Port: 8084. Java 21 / Spring Boot 4.1.1 / MySQL / Flyway / HS256 JWT.

Run:
mvn clean spring-boot:run

Health:
GET http://localhost:8084/actuator/health

APIs:
GET /api/products?search=laptop
GET /api/products/{id}
POST /api/products
PUT /api/products/{id}
PATCH /api/products/{id}/status
DELETE /api/products/{id}

GET: ORG_USER, ORG_ADMIN, SUPER_ADMIN.
Write: ORG_ADMIN.
For SUPER_ADMIN GET requests in a workspace, send X-Organization-Id.
