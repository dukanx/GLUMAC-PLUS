package com.glumacplus.food_ordering.controller;

import com.glumacplus.food_ordering.dto.AnalitikaPregledDto;
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

/**
 * Brojevi za sekciju „Pregled" u admin panelu.
 *
 * <p>Samo vlasnik: ovde stoji promet celog lokala. Panel zaposlenog ima svoj
 * dnevni sažetak kroz {@code /api/smena}, koji ne otkriva ništa van tekućeg dana.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@RestController
@RequestMapping("/api/analitika")
@CrossOrigin
public class AnalitikaController {

    private final AnalitikaService analitikaService;

    public AnalitikaController(AnalitikaService analitikaService) {
        this.analitikaService = analitikaService;
    }

    /**
     * Ceo pregled za period, jednim pozivom.
     *
     * @param od prvi dan perioda, uključivo, u obliku {@code yyyy-MM-dd}
     * @param doDatuma poslednji dan perioda, uključivo
     * @param limit koliko najprodavanijih proizvoda vratiti; podrazumevano 8
     * @return sažetak prometa, statusa, top proizvoda i prihoda po danima
     */
    @GetMapping("/pregled")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnalitikaPregledDto> pregled(
            @RequestParam("od") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate od,
            @RequestParam("do") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate doDatuma,
            @RequestParam(defaultValue = "8") int limit
    ) {
        return ResponseEntity.ok(analitikaService.pregled(od, doDatuma, limit));
    }
}
