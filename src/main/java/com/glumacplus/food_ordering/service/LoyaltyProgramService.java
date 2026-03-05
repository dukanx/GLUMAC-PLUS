package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.LoyaltyProgramMapper;
import com.glumacplus.food_ordering.dto.LoyaltyProgramViewDto;
import com.glumacplus.food_ordering.repository.LoyaltyProgramRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoyaltyProgramService {

    private final LoyaltyProgramRepository loyaltyProgramRepository;

    public LoyaltyProgramService(LoyaltyProgramRepository loyaltyProgramRepository) {
        this.loyaltyProgramRepository = loyaltyProgramRepository;
    }

    public List<LoyaltyProgramViewDto> getAll() {
        return loyaltyProgramRepository.findAll().stream()
                .sorted(Comparator.comparingInt(lp -> lp.getPragBodova()))
                .map(LoyaltyProgramMapper::toViewDto)
                .collect(Collectors.toList());
    }
}
