package com.glumacplus.food_ordering.controller;

import com.glumacplus.food_ordering.model.DanUNedelji;
import com.glumacplus.food_ordering.model.RadnoVreme;
import com.glumacplus.food_ordering.service.RadnoVremeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/radno-vreme")
@CrossOrigin
public class RadnoVremeController {

    private final RadnoVremeService service;

    public RadnoVremeController(RadnoVremeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<RadnoVreme>> getAll(@RequestParam(name = "aktivno", required = false) Boolean aktivno) {
        if (aktivno != null && aktivno) {
            return ResponseEntity.ok(service.getAktivna());
        }
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RadnoVreme> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/dan/{dan}")
    public ResponseEntity<RadnoVreme> getByDan(@PathVariable DanUNedelji dan) {
        return ResponseEntity.ok(service.getByDan(dan));
    }

    @PostMapping
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<RadnoVreme> create(@RequestBody RadnoVreme radnoVreme) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(radnoVreme));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<RadnoVreme> update(@PathVariable Long id, @RequestBody RadnoVreme radnoVreme) {
        return ResponseEntity.ok(service.update(id, radnoVreme));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
