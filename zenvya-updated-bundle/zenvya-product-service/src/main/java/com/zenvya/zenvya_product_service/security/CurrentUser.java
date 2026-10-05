package com.zenvya.zenvya_product_service.security;
import java.util.UUID;
import org.springframework.security.core.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
public final class CurrentUser {
 private CurrentUser(){}
 private static Jwt jwt(){
  Authentication a=SecurityContextHolder.getContext().getAuthentication();
  if(a==null || !(a.getPrincipal() instanceof Jwt j)) throw new IllegalStateException("Authenticated JWT is required");
  return j;
 }
 public static UUID getOrganizationId(){
  String id=jwt().getClaimAsString("organizationId");
  if(id==null || id.isBlank()) throw new IllegalStateException("Organization ID is missing from access token");
  return UUID.fromString(id);
 }
 public static UUID getOrganizationId(String selected){
  if("SUPER_ADMIN".equals(jwt().getClaimAsString("role"))){
   if(selected==null || selected.isBlank()) throw new IllegalStateException("Organization ID is required for Super Admin");
   return UUID.fromString(selected);
  }
  return getOrganizationId();
 }
}
