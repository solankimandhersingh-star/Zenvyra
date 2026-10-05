package com.zenvya.zenvya_product_service.product;
import jakarta.persistence.*;
import java.math.BigDecimal; import java.time.LocalDateTime; import java.util.UUID;
@Entity @Table(name="products")
public class Product {
 @Id @Column(columnDefinition="BINARY(16)") private UUID id;
 @Column(name="organization_id",nullable=false,columnDefinition="BINARY(16)") private UUID organizationId;
 @Column(name="product_code",nullable=false,length=50) private String productCode;
 @Column(nullable=false,length=200) private String name;
 @Column(length=1000) private String description;
 @Column(length=150) private String category;
 @Column(nullable=false,length=30) private String unit;
 @Column(name="selling_price",nullable=false,precision=15,scale=2) private BigDecimal sellingPrice;
 @Column(name="tax_rate",nullable=false,precision=5,scale=2) private BigDecimal taxRate=BigDecimal.ZERO;
 @Column(nullable=false,length=20) private String status="ACTIVE";
 @Column(name="created_at",nullable=false) private LocalDateTime createdAt;
 @Column(name="updated_at",nullable=false) private LocalDateTime updatedAt;
 @PrePersist void create(){if(id==null)id=UUID.randomUUID(); createdAt=updatedAt=LocalDateTime.now();}
 @PreUpdate void update(){updatedAt=LocalDateTime.now();}
 public UUID getId(){return id;} public UUID getOrganizationId(){return organizationId;} public String getProductCode(){return productCode;}
 public String getName(){return name;} public String getDescription(){return description;} public String getCategory(){return category;} public String getUnit(){return unit;}
 public BigDecimal getSellingPrice(){return sellingPrice;} public BigDecimal getTaxRate(){return taxRate;} public String getStatus(){return status;}
 public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
 public void setOrganizationId(UUID v){organizationId=v;} public void setProductCode(String v){productCode=v;} public void setName(String v){name=v;}
 public void setDescription(String v){description=v;} public void setCategory(String v){category=v;} public void setUnit(String v){unit=v;}
 public void setSellingPrice(BigDecimal v){sellingPrice=v;} public void setTaxRate(BigDecimal v){taxRate=v;} public void setStatus(String v){status=v;}
}
