package com.fertilizer.shop.repository;

import com.fertilizer.shop.model.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    List<Farmer> findByNameContainingIgnoreCaseOrPhoneContainingIgnoreCaseOrVillageContainingIgnoreCase(String name, String phone, String village);
    Optional<Farmer> findByPhone(String phone);
}
