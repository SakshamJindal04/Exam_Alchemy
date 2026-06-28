package com.examalchemy.dto;

public class MessageResponse {
    private String message;

    public MessageResponse(String message) {
        this.message = message;
    }

    // --- Getter ---

    public String getMessage() {
        return message;
    }

    // --- Setter ---

    public void setMessage(String message) {
        this.message = message;
    }
}