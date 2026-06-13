package com.fertilizer.shop.dto;

public class LoginResponse {
    private String token;
    private String role;
    private Long farmerId;

    public LoginResponse(String token, String role) {
        this.token = token;
        this.role = role;
        this.farmerId = null;
    }

    public LoginResponse(String token, String role, Long farmerId) {
        this.token = token;
        this.role = role;
        this.farmerId = farmerId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
    }
}
