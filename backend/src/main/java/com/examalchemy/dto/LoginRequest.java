package com.examalchemy.dto;

import jakarta.validation.constraints.NotBlank;
// import lombok.Data; // <-- Removed

// @Data // <-- Removed
public class LoginRequest {
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    // --- Manual Getters ---

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    // --- Manual Setters ---

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}