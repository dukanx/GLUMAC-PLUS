package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.LoyaltyProgramViewDto;
import com.glumacplus.food_ordering.model.LoyaltyProgram;
import com.glumacplus.food_ordering.repository.LoyaltyProgramRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoyaltyProgramServiceTest {

    @Mock
    LoyaltyProgramRepository loyaltyProgramRepository;

    LoyaltyProgramService loyaltyProgramService;

    @BeforeEach
    void setUp() {
        loyaltyProgramService = new LoyaltyProgramService(loyaltyProgramRepository);
    }

    @AfterEach
    void tearDown() {
        loyaltyProgramService = null;
    }

    @Test
    void testGetAllVracaSortiranoPoPragu() {
        LoyaltyProgram glavnaUloga = new LoyaltyProgram("Glavna uloga", 10.0, 500);
        LoyaltyProgram nova = new LoyaltyProgram("Nova zvezda", 0.0, 0);
        LoyaltyProgram epizodista = new LoyaltyProgram("Epizodista", 5.0, 100);

        // pogresan redosled upisa
        when(loyaltyProgramRepository.findAll()).thenReturn(List.of(glavnaUloga, epizodista, nova));

        List<LoyaltyProgramViewDto> result = loyaltyProgramService.getAll();

        assertEquals(3, result.size());
        assertEquals("Nova zvezda", result.get(0).getNivo());
        assertEquals("Epizodista", result.get(1).getNivo());
        assertEquals("Glavna uloga", result.get(2).getNivo());
    }

    @Test
    void testGetAllTacnoMapiraSvaPolja() {
        LoyaltyProgram glavnaUloga = new LoyaltyProgram("Glavna uloga", 10.0, 500);
        glavnaUloga.setId(42L);

        when(loyaltyProgramRepository.findAll()).thenReturn(List.of(glavnaUloga));

        List<LoyaltyProgramViewDto> result = loyaltyProgramService.getAll();

        LoyaltyProgramViewDto dto = result.getFirst();
        assertEquals(42L, dto.getId());
        assertEquals("Glavna uloga", dto.getNivo());
        assertEquals(10.0, dto.getPopust());
        assertEquals(500, dto.getPragBodova());
    }

    @Test
    void testGetAllPraznaListaVracaPraznu() {
        when(loyaltyProgramRepository.findAll()).thenReturn(List.of());

        List<LoyaltyProgramViewDto> result = loyaltyProgramService.getAll();

        assertTrue(result.isEmpty());
    }
}
