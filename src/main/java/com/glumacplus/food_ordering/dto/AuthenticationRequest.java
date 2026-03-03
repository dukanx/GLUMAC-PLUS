package com.glumacplus.food_ordering.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthenticationRequest {

    @NotBlank(message = "Email je obavezan")
    @Email(message = "Email nije validan")
    private String email;

    @NotBlank(message = "Lozinka je obavezna")
    private String lozinka;


    public AuthenticationRequest() {}

    public AuthenticationRequest(String email, String lozinka) {
        this.email = email;
        this.lozinka = lozinka;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getLozinka() { return lozinka; }
    public void setLozinka(String lozinka) { this.lozinka = lozinka; }
}
