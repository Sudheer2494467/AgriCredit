package com.fertilizer.shop.service;

import com.fertilizer.shop.dto.LoginRequest;
import com.fertilizer.shop.dto.LoginResponse;
import com.fertilizer.shop.model.Farmer;
import com.fertilizer.shop.model.Role;
import com.fertilizer.shop.model.User;
import com.fertilizer.shop.repository.FarmerRepository;
import com.fertilizer.shop.repository.UserRepository;
import com.fertilizer.shop.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final FarmerRepository farmerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        if (newPassword == null || newPassword.length() < 4) {
            throw new RuntimeException("New password must be at least 4 characters");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public LoginResponse authenticate(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username/password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username/password");
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole().name());
        LoginResponse response = new LoginResponse(token, user.getRole().name());

        if (user.getRole() == Role.ROLE_USER) {
            Farmer farmer = farmerRepository.findByPhone(request.getUsername()).orElse(null);
            if (farmer != null) {
                response.setFarmerId(farmer.getId());
            }
        }

        return response;
    }
}
