package com.fertilizer.shop.dto;

/**
 * Response DTO returned after creating a new farmer.
 * Contains the farmer data plus auto-generated login credentials.
 */
public class FarmerCreateResponse {
    private Long id;
    private String name;
    private String phone;
    private String village;
    private Double landAcres;
    // Login credentials generated for the farmer
    private String loginUsername;
    private String loginPassword; // plain text shown once to admin

    public FarmerCreateResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }
    public Double getLandAcres() { return landAcres; }
    public void setLandAcres(Double landAcres) { this.landAcres = landAcres; }
    public String getLoginUsername() { return loginUsername; }
    public void setLoginUsername(String loginUsername) { this.loginUsername = loginUsername; }
    public String getLoginPassword() { return loginPassword; }
    public void setLoginPassword(String loginPassword) { this.loginPassword = loginPassword; }
}
