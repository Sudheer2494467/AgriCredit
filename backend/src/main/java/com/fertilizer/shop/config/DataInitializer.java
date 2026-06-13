package com.fertilizer.shop.config;

import com.fertilizer.shop.model.*;
import com.fertilizer.shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final ProductCategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final FarmerRepository farmerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            userRepository.save(User.builder().username("admin").password(passwordEncoder.encode("admin123")).role(Role.ROLE_ADMIN).build());
        }

        if (userRepository.findByUsername("farmer1").isEmpty()) {
            userRepository.save(User.builder().username("farmer1").password(passwordEncoder.encode("farmer123")).role(Role.ROLE_USER).build());
        }

        if (categoryRepository.count() == 0) {
            List<String> defaults = List.of("Fertilizers", "Pesticides", "Herbicides", "Fungicides", "Seeds");
            defaults.forEach(name -> categoryRepository.save(ProductCategory.builder().name(name).build()));
        }

        if (productRepository.count() == 0) {
            ProductCategory fert = categoryRepository.findAll().stream().filter(c -> c.getName().equals("Fertilizers")).findFirst().orElseThrow();
            Product urea = productRepository.save(Product.builder().name("Urea").unit("bag").pricePerUnit(new BigDecimal("270.00")).category(fert).build());
            stockRepository.save(Stock.builder().product(urea).quantity(new BigDecimal("100")).build());
        }

        if (farmerRepository.findByPhone("farmer1").isEmpty()) {
            farmerRepository.save(Farmer.builder()
                .name("Ravi Kumar")
                .phone("farmer1")
                .village("Nandgaon")
                .landAcres(new BigDecimal("4.5"))
                .currentBalance(BigDecimal.ZERO)
                .build());
        }

        if (farmerRepository.findByPhone("9876543210").isEmpty()) {
            farmerRepository.save(Farmer.builder()
                .name("Priya Singh")
                .phone("9876543210")
                .village("Wardha")
                .landAcres(new BigDecimal("3.0"))
                .currentBalance(new BigDecimal("5000"))
                .build());
        }
    }
}
