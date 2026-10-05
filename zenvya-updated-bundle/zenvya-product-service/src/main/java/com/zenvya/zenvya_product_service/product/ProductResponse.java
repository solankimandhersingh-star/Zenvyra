package com.zenvya.zenvya_product_service.product;
import java.math.BigDecimal; import java.time.LocalDateTime; import java.util.UUID;
public record ProductResponse(UUID id,UUID organizationId,String productCode,String name,String description,String category,String unit,
BigDecimal sellingPrice,BigDecimal taxRate,String status,LocalDateTime createdAt,LocalDateTime updatedAt){}
