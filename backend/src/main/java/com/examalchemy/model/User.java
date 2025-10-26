package com.examalchemy.model;

// Lombok imports are removed
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

// @Data and @NoArgsConstructor annotations are removed
@Document(collection = "users")
public class User implements UserDetails {

    @Id
    private String id;

    private String username;

    @Indexed(unique = true)
    private String email;

    private String password;

    private Set<String> roles; // e.g., "ROLE_STUDENT", "ROLE_TEACHER"

    // --- CONSTRUCTORS ---

    /**
     * Replaces @NoArgsConstructor
     */
    public User() {
    }

    /**
     * Your existing constructor
     */
    public User(String username, String email, String password, Set<String> roles) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.roles = roles;
    }

    // --- GETTERS AND SETTERS (Replaces @Data) ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setUsername(String username) {
        this.username = username;
    }


    // --- UserDetails Methods (Now explicitly implemented) ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    /**
     * This @Override is required by UserDetails
     */
    @Override
    public String getPassword() {
        return this.password;
    }

    /**
     * This @Override is required by UserDetails
     */
    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}