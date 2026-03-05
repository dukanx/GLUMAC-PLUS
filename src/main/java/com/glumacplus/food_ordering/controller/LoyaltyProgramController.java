package com.glumacplus.food_ordering.controller;

import com.glumacplus.food_ordering.dto.LoyaltyProgramViewDto;
import com.glumacplus.food_ordering.service.LoyaltyProgramService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/loyalty_program")
@CrossOrigin
public class LoyaltyProgramController {

    private final LoyaltyProgramService loyaltyProgramService;

    public LoyaltyProgramController(LoyaltyProgramService loyaltyProgramService) {
        this.loyaltyProgramService = loyaltyProgramService;
    }

    @GetMapping
    public ResponseEntity<List<LoyaltyProgramViewDto>> getAll() {
        return ResponseEntity.ok(loyaltyProgramService.getAll());
    }
}
