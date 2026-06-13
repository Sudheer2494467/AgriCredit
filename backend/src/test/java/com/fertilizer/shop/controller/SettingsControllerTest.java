package com.fertilizer.shop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fertilizer.shop.model.StoreSettings;
import com.fertilizer.shop.repository.StoreSettingsRepository;
import com.fertilizer.shop.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = SettingsController.class,
    excludeAutoConfiguration = {SecurityAutoConfiguration.class},
    excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(
        type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE, 
        classes = {com.fertilizer.shop.security.SecurityConfig.class, com.fertilizer.shop.security.JwtAuthFilter.class}
    )
)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for simple controller test
public class SettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StoreSettingsRepository storeSettingsRepository;

    private ObjectMapper objectMapper = new ObjectMapper();
    private StoreSettings mockSettings;

    @BeforeEach
    void setUp() {
        mockSettings = StoreSettings.builder()
                .id(1L)
                .productInterestRate(new BigDecimal("2.5"))
                .cashInterestRate(new BigDecimal("3.0"))
                .build();
    }

    @Test
    void testGetSettings() throws Exception {
        Mockito.when(storeSettingsRepository.findById(1L)).thenReturn(Optional.of(mockSettings));

        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productInterestRate").value(2.5))
                .andExpect(jsonPath("$.cashInterestRate").value(3.0));
    }

    @Test
    void testUpdateSettings() throws Exception {
        Mockito.when(storeSettingsRepository.findById(1L)).thenReturn(Optional.of(mockSettings));
        Mockito.when(storeSettingsRepository.save(any(StoreSettings.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StoreSettings newSettings = StoreSettings.builder()
                .productInterestRate(new BigDecimal("4.0"))
                .cashInterestRate(new BigDecimal("5.0"))
                .build();

        mockMvc.perform(put("/api/settings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newSettings)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productInterestRate").value(4.0))
                .andExpect(jsonPath("$.cashInterestRate").value(5.0));
    }
}
