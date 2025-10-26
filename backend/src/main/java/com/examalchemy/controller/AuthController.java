package com.examalchemy.controller;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examalchemy.dto.JwtAuthResponse;
import com.examalchemy.dto.LoginRequest;
import com.examalchemy.dto.MessageResponse;
import com.examalchemy.dto.SignUpRequest;
import com.examalchemy.model.User; // <-- 1. MAKE SURE THIS IS THE CORRECT IMPORT
// import org.springframework.security.core.userdetails.User; // <-- DELETE THIS LINE IF IT EXISTS
import com.examalchemy.repository.UserRepository;
import com.examalchemy.security.JwtTokenProvider;

import jakarta.validation.Valid;
import lombok.Data;

@Data
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        // This line requires the correct "import com.examalchemy.model.User;"
        User userDetails = (User) authentication.getPrincipal();

        // These methods (getId, getEmail, etc.) will now work
        return ResponseEntity.ok(new JwtAuthResponse(
            jwt,
            userDetails.getId(),
            userDetails.getUsername(),
            userDetails.getEmail(),
            userDetails.getRoles()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return new ResponseEntity<>("Error: Email is already in use!", HttpStatus.BAD_REQUEST);
        }

        // --- 2. Corrected Role Logic ---
        Set<String> roles = new HashSet<>();
        
        // Check if the provided roles list contains "teacher" (case-insensitive)
        if (signUpRequest.getRoles() != null && 
            signUpRequest.getRoles().stream().anyMatch(role -> role.equalsIgnoreCase("teacher"))) {
            
            roles.add("ROLE_TEACHER");
        
        } else {
            // If no teacher role is found, or if roles are empty, default to student
            roles.add("ROLE_STUDENT");
        }
        // --- End of Corrected Logic ---

        // Create new user's account
        User user = new User(
            signUpRequest.getUsername(),
            signUpRequest.getEmail(),
            passwordEncoder.encode(signUpRequest.getPassword()),
            roles
        );

        userRepository.save(user);

        return new ResponseEntity<>(new MessageResponse("User registered successfully!"), HttpStatus.CREATED);
    }
}