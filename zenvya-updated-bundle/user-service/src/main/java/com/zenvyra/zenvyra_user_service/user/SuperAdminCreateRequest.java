package com.zenvyra.zenvyra_user_service.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SuperAdminCreateRequest {
    @NotBlank @Size(max = 100)
    private String username;
    @NotBlank @Size(max = 100)
    private String firstName;
    @Size(max = 100)
    private String lastName;
    @Email @Size(max = 255)
    private String email;
    @Size(max = 30)
    private String mobile;
    @NotBlank @Size(min = 8, max = 100)
    private String password;

    public String getUsername(){return username;}
    public void setUsername(String username){this.username=username;}
    public String getFirstName(){return firstName;}
    public void setFirstName(String firstName){this.firstName=firstName;}
    public String getLastName(){return lastName;}
    public void setLastName(String lastName){this.lastName=lastName;}
    public String getEmail(){return email;}
    public void setEmail(String email){this.email=email;}
    public String getMobile(){return mobile;}
    public void setMobile(String mobile){this.mobile=mobile;}
    public String getPassword(){return password;}
    public void setPassword(String password){this.password=password;}
}
