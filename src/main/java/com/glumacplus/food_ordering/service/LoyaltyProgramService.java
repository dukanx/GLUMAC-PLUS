package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.LoyaltyProgramMapper;
import com.glumacplus.food_ordering.dto.LoyaltyProgramViewDto;
import com.glumacplus.food_ordering.model.LoyaltyProgram;
import com.glumacplus.food_ordering.repository.LoyaltyProgramRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servis za rad sa nivoima loyalty programa.
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Service
public class LoyaltyProgramService {

    private final LoyaltyProgramRepository loyaltyProgramRepository;

    /**
     * Kreira servis sa potrebnim repozitorijumom.
     *
     * @param loyaltyProgramRepository repozitorijum loyalty programa
     */
    public LoyaltyProgramService(LoyaltyProgramRepository loyaltyProgramRepository) {
        this.loyaltyProgramRepository = loyaltyProgramRepository;
    }

    /**
     * Vraća sve nivoe loyalty programa, sortirane rastuće po pragu bodova.
     *
     * @return lista nivoa loyalty programa
     */
    public List<LoyaltyProgramViewDto> getAll() {
        return loyaltyProgramRepository.findAll().stream()
                .sorted(Comparator.comparingInt(LoyaltyProgram::getPragBodova))
                .map(LoyaltyProgramMapper::toViewDto)
                .collect(Collectors.toList());
    }
}
