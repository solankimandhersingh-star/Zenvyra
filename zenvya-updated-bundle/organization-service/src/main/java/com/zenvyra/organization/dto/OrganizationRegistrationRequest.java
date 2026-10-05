package com.zenvyra.organization.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OrganizationRegistrationRequest {
    @NotBlank @Size(max = 200)
    private String name;
    @Size(max = 100) private String businessType;
    @Email @Size(max = 255) private String email;
    @Size(max = 30) private String mobile;
    @Size(max = 255) private String addressLine1;
    @Size(max = 255) private String addressLine2;
    @Size(max = 100) private String city;
    @Size(max = 100) private String state;
    @Size(max = 100) private String country;
    @Size(max = 20) private String postalCode;
    @Size(max = 100) private String taxNumber;
    @Size(max = 500) private String logoUrl;

    public String getName(){return name;} public void setName(String v){name=v;}
    public String getBusinessType(){return businessType;} public void setBusinessType(String v){businessType=v;}
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getMobile(){return mobile;} public void setMobile(String v){mobile=v;}
    public String getAddressLine1(){return addressLine1;} public void setAddressLine1(String v){addressLine1=v;}
    public String getAddressLine2(){return addressLine2;} public void setAddressLine2(String v){addressLine2=v;}
    public String getCity(){return city;} public void setCity(String v){city=v;}
    public String getState(){return state;} public void setState(String v){state=v;}
    public String getCountry(){return country;} public void setCountry(String v){country=v;}
    public String getPostalCode(){return postalCode;} public void setPostalCode(String v){postalCode=v;}
    public String getTaxNumber(){return taxNumber;} public void setTaxNumber(String v){taxNumber=v;}
    public String getLogoUrl(){return logoUrl;} public void setLogoUrl(String v){logoUrl=v;}
}
