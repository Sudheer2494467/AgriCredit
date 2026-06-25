package com.fertilizer.shop.config;

import com.fertilizer.shop.model.*;
import com.fertilizer.shop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductCategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final FarmerRepository farmerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional // Ensures entire seeding block runs atomically
    public void run(String... args) {
        try {
            initializeUsers();
            initializeCategoriesAndProducts();
            initializeFarmers();
        } catch (DataIntegrityViolationException e) {
            // Catches race conditions if multiple application instances deploy simultaneously
            log.warn("Database initialization skipped: Data already seeded by a concurrent deployment instance.");
        }
    }

    private void initializeUsers() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            userRepository.save(User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ROLE_ADMIN)
                .build());
        }

        if (userRepository.findByUsername("farmer1").isEmpty()) {
            userRepository.save(User.builder()
                .username("farmer1")
                .password(passwordEncoder.encode("farmer123"))
                .role(Role.ROLE_USER)
                .build());
        }
    }

    private void initializeCategoriesAndProducts() {
        // Safe category creation logic checking individual existence instead of table count
        List<String> defaults = List.of("Fertilizers", "Pesticides", "Herbicides", "Fungicides", "Seeds");
        defaults.forEach(name -> {
            if (categoryRepository.findByName(name).isEmpty()) {
                categoryRepository.save(ProductCategory.builder().name(name).build());
            }
        });

        // Safe recovery/fetch of the targeting category
        ProductCategory fert = categoryRepository.findByName("Fertilizers")
            .orElseThrow(() -> new IllegalStateException("Required category 'Fertilizers' could not be found or initialized."));

        // Seed product & stock safely based on specific product existence
        if (productRepository.findByName("Urea").isEmpty()) {
            Product urea = productRepository.save(Product.builder()
                .name("Urea")
                .unit("bag")
                .pricePerUnit(new BigDecimal("270.00"))
                .category(fert)
                .build());

            stockRepository.save(Stock.builder()
                .product(urea)
                .quantity(new BigDecimal("100"))
                .build());
        }
    }

    private void initializeFarmers() {
        // Fixed: Replaced alpha-numeric string "farmer1" with a numeric format to avoid DB validation crashes
        if (farmerRepository.findByPhone("9876543211").isEmpty()) {
            farmerRepository.save(Farmer.builder()
                .name("Ravi Kumar")
                .phone("9876543211") 
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
// package com.fertilizer.shop.config;

// import com.fertilizer.shop.model.*;
// import com.fertilizer.shop.repository.*;
// import lombok.RequiredArgsConstructor;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Component;

// import java.math.BigDecimal;
// import java.util.List;

// @Component
// @RequiredArgsConstructor
// public class DataInitializer implements CommandLineRunner {
//     private final UserRepository userRepository;
//     private final ProductCategoryRepository categoryRepository;
//     private final ProductRepository productRepository;
//     private final StockRepository stockRepository;
//     private final FarmerRepository farmerRepository;
//     private final PasswordEncoder passwordEncoder;

//     @Override
//     public void run(String... args) {
//         if (userRepository.findByUsername("admin").isEmpty()) {
//             userRepository.save(User.builder().username("admin").password(passwordEncoder.encode("admin123")).role(Role.ROLE_ADMIN).build());
//         }

//         if (userRepository.findByUsername("farmer1").isEmpty()) {
//             userRepository.save(User.builder().username("farmer1").password(passwordEncoder.encode("farmer123")).role(Role.ROLE_USER).build());
//         }

//         if (categoryRepository.count() == 0) {
//             List<String> defaults = List.of("Fertilizers", "Pesticides", "Herbicides", "Fungicides", "Seeds");
//             defaults.forEach(name -> categoryRepository.save(ProductCategory.builder().name(name).build()));
//         }

//         if (productRepository.count() == 0) {
//             ProductCategory fert = categoryRepository.findAll().stream().filter(c -> c.getName().equals("Fertilizers")).findFirst().orElseThrow();
//             Product urea = productRepository.save(Product.builder().name("Urea").unit("bag").pricePerUnit(new BigDecimal("270.00")).category(fert).build());
//             stockRepository.save(Stock.builder().product(urea).quantity(new BigDecimal("100")).build());
//         }

//         if (farmerRepository.findByPhone("farmer1").isEmpty()) {
//             farmerRepository.save(Farmer.builder()
//                 .name("Ravi Kumar")
//                 .phone("farmer1")
//                 .village("Nandgaon")
//                 .landAcres(new BigDecimal("4.5"))
//                 .currentBalance(BigDecimal.ZERO)
//                 .build());
//         }

//         if (farmerRepository.findByPhone("9876543210").isEmpty()) {
//             farmerRepository.save(Farmer.builder()
//                 .name("Priya Singh")
//                 .phone("9876543210")
//                 .village("Wardha")
//                 .landAcres(new BigDecimal("3.0"))
//                 .currentBalance(new BigDecimal("5000"))
//                 .build());
//         }
//     }
// }
