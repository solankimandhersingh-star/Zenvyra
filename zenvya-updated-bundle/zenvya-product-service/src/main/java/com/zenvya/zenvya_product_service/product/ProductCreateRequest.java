package com.zenvya.zenvya_product_service.product;
import java.math.BigDecimal; import jakarta.validation.constraints.*;
public record ProductCreateRequest(@NotBlank @Size(max=200) String name,@Size(max=1000) String description,@Size(max=150) String category,
@NotBlank @Size(max=30) String unit,@NotNull @DecimalMin("0.00") BigDecimal sellingPrice,@NotNull @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal taxRate){}
