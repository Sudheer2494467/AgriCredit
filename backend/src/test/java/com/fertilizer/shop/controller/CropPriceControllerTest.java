package com.fertilizer.shop.controller;

import com.fertilizer.shop.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(
    controllers = CropPriceController.class,
    excludeAutoConfiguration = {SecurityAutoConfiguration.class},
    excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(
        type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE, 
        classes = {com.fertilizer.shop.security.SecurityConfig.class, com.fertilizer.shop.security.JwtAuthFilter.class}
    )
)
@AutoConfigureMockMvc(addFilters = false)
public class CropPriceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testGetCropPrices() throws Exception {
        mockMvc.perform(get("/api/crop-prices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.source").value("demo"))
                .andExpect(jsonPath("$.prices").isArray())
                .andExpect(jsonPath("$.prices", hasSize(3))) // Should only have Paddy, Cotton, Mirchi
                .andExpect(jsonPath("$.prices[*].crop", containsInAnyOrder("Paddy", "Cotton", "Mirchi")))
                .andExpect(jsonPath("$.prices[0].color").value("#D4AF37")); // Verify our human-picked color
    }
}
