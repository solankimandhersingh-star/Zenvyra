package com.zenvya.zenvya_product_service.product;
import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface ProductRepository extends JpaRepository<Product,UUID>{
 List<Product> findAllByOrganizationIdOrderByNameAsc(UUID organizationId);
 List<Product> findByOrganizationIdAndNameContainingIgnoreCaseOrderByNameAsc(UUID organizationId,String name);
 Optional<Product> findByIdAndOrganizationId(UUID id,UUID organizationId);
 Optional<Product> findTopByOrganizationIdOrderByProductCodeDesc(UUID organizationId);
}
