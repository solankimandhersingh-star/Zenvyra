package com.zenvya.zenvya_product_service.product;
import java.util.*; import com.zenvya.zenvya_product_service.security.CurrentUser;
import org.springframework.http.HttpStatus; import org.springframework.stereotype.Service; import org.springframework.web.server.ResponseStatusException;
@Service public class ProductService {
 private final ProductRepository repo; public ProductService(ProductRepository repo){this.repo=repo;}
 public List<ProductResponse> getAll(String search,String selected){
  UUID org=CurrentUser.getOrganizationId(selected);
  List<Product> p=(search==null||search.isBlank())?repo.findAllByOrganizationIdOrderByNameAsc(org):repo.findByOrganizationIdAndNameContainingIgnoreCaseOrderByNameAsc(org,search.trim());
  return p.stream().map(this::response).toList();
 }
 public ProductResponse getById(UUID id){UUID org=CurrentUser.getOrganizationId(); return response(repo.findByIdAndOrganizationId(id,org).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Product not found")));}
 public ProductResponse create(ProductCreateRequest r){UUID org=CurrentUser.getOrganizationId(); Product p=new Product();p.setOrganizationId(org);p.setProductCode(nextCode(org));apply(p,r);return response(repo.save(p));}
 public ProductResponse update(UUID id,ProductUpdateRequest r){Product p=find(id);apply(p,r);return response(repo.save(p));}
 public ProductResponse status(UUID id,ProductStatusUpdateRequest r){Product p=find(id);p.setStatus(r.status());return response(repo.save(p));}
 public void delete(UUID id){repo.delete(find(id));}
 private Product find(UUID id){UUID org=CurrentUser.getOrganizationId();return repo.findByIdAndOrganizationId(id,org).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Product not found"));}
 private void apply(Product p,ProductCreateRequest r){p.setName(r.name().trim());p.setDescription(r.description());p.setCategory(r.category());p.setUnit(r.unit().trim());p.setSellingPrice(r.sellingPrice());p.setTaxRate(r.taxRate());}
 private void apply(Product p,ProductUpdateRequest r){p.setName(r.name().trim());p.setDescription(r.description());p.setCategory(r.category());p.setUnit(r.unit().trim());p.setSellingPrice(r.sellingPrice());p.setTaxRate(r.taxRate());}
 private String nextCode(UUID org){return repo.findTopByOrganizationIdOrderByProductCodeDesc(org).map(Product::getProductCode).map(this::increment).orElse("PROD-000001");}
 private String increment(String code){try{return String.format("PROD-%06d",Integer.parseInt(code.substring(code.lastIndexOf('-')+1))+1);}catch(Exception e){return "PROD-000001";}}
 private ProductResponse response(Product p){return new ProductResponse(p.getId(),p.getOrganizationId(),p.getProductCode(),p.getName(),p.getDescription(),p.getCategory(),p.getUnit(),p.getSellingPrice(),p.getTaxRate(),p.getStatus(),p.getCreatedAt(),p.getUpdatedAt());}
}
