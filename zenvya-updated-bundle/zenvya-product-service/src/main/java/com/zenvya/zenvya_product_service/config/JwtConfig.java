package com.zenvya.zenvya_product_service.config;
import java.nio.charset.StandardCharsets;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
@Configuration
public class JwtConfig {
 @Value("${jwt.secret}") private String jwtSecret;
 @Bean public SecretKeySpec jwtSecretKey(){ return new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8),"HmacSHA256"); }
 @Bean public JwtDecoder jwtDecoder(SecretKeySpec key){ return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build(); }
}
