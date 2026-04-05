package com.glumacplus.food_ordering.controller;

import com.glumacplus.food_ordering.dto.AnalitikaPrihodDto;
import com.glumacplus.food_ordering.dto.AnalitikaStatusiDto;
import com.glumacplus.food_ordering.dto.AnalitikaTopProizvodDto;
import com.glumacplus.food_ordering.service.AnalitikaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analitika")
@CrossOrigin
public class AnalitikaController {

    private final AnalitikaService analitikaService;

    public AnalitikaController(AnalitikaService analitikaService) {
        this.analitikaService = analitikaService;
    }

    @GetMapping("/top-proizvodi")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<List<AnalitikaTopProizvodDto>> getTopProizvodi(
            @RequestParam("od") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate odDatuma,
            @RequestParam("do") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate doDatuma,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(analitikaService.getTopProizvodi(odDatuma, doDatuma, limit));
    }

    @GetMapping("/prihod")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<AnalitikaPrihodDto> getPrihod(
            @RequestParam("od") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate odDatuma,
            @RequestParam("do") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate doDatuma
    ) {
        return ResponseEntity.ok(analitikaService.getPrihod(odDatuma, doDatuma));
    }

    @GetMapping("/statusi")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<AnalitikaStatusiDto> getStatusi(
            @RequestParam("od") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate odDatuma,
            @RequestParam("do") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate doDatuma
    ) {
        return ResponseEntity.ok(analitikaService.getStatusi(odDatuma, doDatuma));
    }
}
