package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.RadnoVremeDto;
import com.glumacplus.food_ordering.dto.RadnoVremeViewDto;
import com.glumacplus.food_ordering.model.DanUNedelji;
import com.glumacplus.food_ordering.model.RadnoVreme;
import com.glumacplus.food_ordering.repository.RadnoVremeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RadnoVremeServiceTest {

    @Mock
    RadnoVremeRepository repository;

    RadnoVremeService radnoVremeService;

    @BeforeEach
    void setUp() {
        radnoVremeService = new RadnoVremeService(repository);
    }

    @AfterEach
    void tearDown() {
        radnoVremeService = null;
    }

    private RadnoVreme radnoVreme(Long id, DanUNedelji dan) {
        RadnoVreme rv = new RadnoVreme(dan, LocalTime.of(8, 0), LocalTime.of(22, 0), true);
        rv.setId(id);
        return rv;
    }

    private RadnoVremeDto dto(DanUNedelji dan, LocalTime od, LocalTime doV, Boolean aktivno) {
        RadnoVremeDto dto = new RadnoVremeDto();
        dto.setDan(dan);
        dto.setOdVremena(od);
        dto.setDoVremena(doV);
        dto.setAktivno(aktivno);
        return dto;
    }

    // SO: getById

    @Test
    void testGetByIdUspesno() {
        RadnoVreme rv = radnoVreme(1L, DanUNedelji.PONEDELJAK);
        when(repository.findById(1L)).thenReturn(Optional.of(rv));

        RadnoVremeViewDto result = radnoVremeService.getById(1L);

        assertEquals(DanUNedelji.PONEDELJAK, result.getDan());
        assertEquals(LocalTime.of(8, 0), result.getOdVremena());
        assertEquals(LocalTime.of(22, 0), result.getDoVremena());
    }

    @Test
    void testGetByIdNePostojiBaca404() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> radnoVremeService.getById(99L)
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    // SO: create

    @Test
    void testCreateUspesno() {
        RadnoVremeDto dto = dto(DanUNedelji.UTORAK, LocalTime.of(9, 0), LocalTime.of(17, 0), true);
        when(repository.save(any(RadnoVreme.class))).thenAnswer(inv -> inv.getArgument(0));

        RadnoVremeViewDto result = radnoVremeService.create(dto);

        ArgumentCaptor<RadnoVreme> captor = ArgumentCaptor.forClass(RadnoVreme.class);
        verify(repository).save(captor.capture());
        RadnoVreme zaSnimanje = captor.getValue();

        assertEquals(DanUNedelji.UTORAK, zaSnimanje.getDan());
        assertEquals(LocalTime.of(9, 0), zaSnimanje.getOdVremena());
        assertEquals(LocalTime.of(17, 0), zaSnimanje.getDoVremena());
        assertTrue(zaSnimanje.getAktivno());
        assertEquals(DanUNedelji.UTORAK, result.getDan());
    }

    // SO: update

    @Test
    void testUpdateUspesno() {
        RadnoVreme postojece = radnoVreme(1L, DanUNedelji.SREDA);

        RadnoVremeDto dto = dto(DanUNedelji.SREDA, LocalTime.of(10, 0), LocalTime.of(20, 0), false);

        when(repository.findById(1L)).thenReturn(Optional.of(postojece));
        when(repository.save(any(RadnoVreme.class))).thenAnswer(inv -> inv.getArgument(0));

        RadnoVremeViewDto result = radnoVremeService.update(1L, dto);

        assertEquals(LocalTime.of(10, 0), result.getOdVremena());
        assertEquals(LocalTime.of(20, 0), result.getDoVremena());
        assertFalse(result.getAktivno());

        ArgumentCaptor<RadnoVreme> captor = ArgumentCaptor.forClass(RadnoVreme.class);
        verify(repository).save(captor.capture());
        assertEquals(LocalTime.of(10, 0), captor.getValue().getOdVremena());
    }

    @Test
    void testUpdateAktivnoNullZadrzavaStaro() {
        RadnoVreme postojece = radnoVreme(1L, DanUNedelji.SREDA);

        RadnoVremeDto dto = dto(DanUNedelji.SREDA, LocalTime.of(10, 0), LocalTime.of(20, 0), null);

        when(repository.findById(1L)).thenReturn(Optional.of(postojece));
        when(repository.save(any(RadnoVreme.class))).thenAnswer(inv -> inv.getArgument(0));

        RadnoVremeViewDto result = radnoVremeService.update(1L, dto);

        // ostalo se promenilo, ali aktivno je ostalo true jer je u dto bilo null
        assertEquals(LocalTime.of(10, 0), result.getOdVremena());
        assertTrue(result.getAktivno());
    }

    @Test
    void testUpdateNePostojiBaca404() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> radnoVremeService.update(99L, new RadnoVremeDto())
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(repository, never()).save(any());
    }

    // SO: delete

    @Test
    void testDeleteUspesno() {
        when(repository.existsById(1L)).thenReturn(true);

        radnoVremeService.delete(1L);

        verify(repository).deleteById(1L);
    }

    @Test
    void testDeleteNePostojiBaca404() {
        when(repository.existsById(99L)).thenReturn(false);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> radnoVremeService.delete(99L)
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(repository, never()).deleteById(any());
    }
}
