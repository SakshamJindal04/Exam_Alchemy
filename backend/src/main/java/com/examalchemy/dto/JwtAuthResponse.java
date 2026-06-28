package com.examalchemy.dto;

import java.util.Set;

public class JwtAuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private String id;
    private String username;
    private String email;
    private Set<String> roles;

    public JwtAuthResponse(String token, String id, String username, String email, Set<String> roles) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }

    // --- Getters ---

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public Set<String> getRoles() {
        return roles;
    }

    // --- Setters ---

    public void setToken(String token) {
        this.token = token;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}