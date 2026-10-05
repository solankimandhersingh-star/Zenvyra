package com.zenvya.zenvya_product_service.product;
import java.util.*; import jakarta.validation.Valid; import org.springframework.http.*; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/products")
public class ProductController {
 private final ProductService service; public ProductController(ProductService service){this.service=service;}
 @GetMapping public List<ProductResponse> getAll(@RequestParam(required=false) String search,@RequestHeader(value="X-Organization-Id",required=false) String selected){return service.getAll(search,selected);}
 @GetMapping("/{id}") public ProductResponse getById(@PathVariable UUID id){return service.getById(id);}
 @PostMapping public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductCreateRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(service.create(r));}
 @PutMapping("/{id}") public ProductResponse update(@PathVariable UUID id,@Valid @RequestBody ProductUpdateRequest r){return service.update(id,r);}
 @PatchMapping("/{id}/status") public ProductResponse status(@PathVariable UUID id,@Valid @RequestBody ProductStatusUpdateRequest r){return service.status(id,r);}
 @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable UUID id){service.delete(id);return ResponseEntity.noContent().build();}
}
