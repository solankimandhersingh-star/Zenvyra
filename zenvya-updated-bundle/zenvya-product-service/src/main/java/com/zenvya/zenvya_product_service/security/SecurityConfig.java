package com.zenvya.zenvya_product_service.security;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.*;
import org.springframework.security.web.SecurityFilterChain;
@Configuration @EnableMethodSecurity
public class SecurityConfig {
 @Bean SecurityFilterChain securityFilterChain(HttpSecurity http)throws Exception{
  http.csrf(c->c.disable()).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
   .authorizeHttpRequests(a->a.requestMatchers("/actuator/health").permitAll()
   .requestMatchers(HttpMethod.GET,"/api/products/**").hasAnyRole("ORG_USER","ORG_ADMIN","SUPER_ADMIN")
   .requestMatchers(HttpMethod.POST,"/api/products").hasRole("ORG_ADMIN")
   .requestMatchers(HttpMethod.PUT,"/api/products/**").hasRole("ORG_ADMIN")
   .requestMatchers(HttpMethod.PATCH,"/api/products/**").hasRole("ORG_ADMIN")
   .requestMatchers(HttpMethod.DELETE,"/api/products/**").hasRole("ORG_ADMIN")
   .anyRequest().authenticated())
   .oauth2ResourceServer(o->o.jwt(j->j.jwtAuthenticationConverter(jwtAuthenticationConverter())));
  return http.build();
 }
 @Bean JwtAuthenticationConverter jwtAuthenticationConverter(){
  JwtGrantedAuthoritiesConverter c=new JwtGrantedAuthoritiesConverter();
  c.setAuthoritiesClaimName("role"); c.setAuthorityPrefix("ROLE_");
  JwtAuthenticationConverter x=new JwtAuthenticationConverter(); x.setJwtGrantedAuthoritiesConverter(c); return x;
 }
}
