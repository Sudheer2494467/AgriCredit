package com.fertilizer.shop.controller;

import com.fertilizer.shop.dto.InterestRequest;
import com.fertilizer.shop.model.InterestRecord;
import com.fertilizer.shop.service.InterestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/interest")
@RequiredArgsConstructor
public class InterestController {
    private final InterestService interestService;

    @PostMapping("/calculate")
    public InterestRecord calculate(@RequestBody InterestRequest req) {
        return interestService.calculateInterest(req);
    }

    @GetMapping("/farmer/{farmerId}")
    public List<InterestRecord> byFarmer(@PathVariable Long farmerId) {
        return interestService.getByFarmer(farmerId);
    }
}
