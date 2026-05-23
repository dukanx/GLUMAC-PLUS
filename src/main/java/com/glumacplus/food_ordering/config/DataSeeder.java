package com.glumacplus.food_ordering.config;

import com.glumacplus.food_ordering.model.DanUNedelji;
import com.glumacplus.food_ordering.model.Korisnik;
import com.glumacplus.food_ordering.model.LoyaltyProgram;
import com.glumacplus.food_ordering.model.RadnoVreme;
import com.glumacplus.food_ordering.model.Uloga;
import com.glumacplus.food_ordering.repository.KorisnikRepository;
import com.glumacplus.food_ordering.repository.LoyaltyProgramRepository;
import com.glumacplus.food_ordering.repository.RadnoVremeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.http.HttpStatus;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalTime;

@Component
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

    private final KorisnikRepository korisnikRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoyaltyProgramRepository loyaltyProgramRepository;
    private final RadnoVremeRepository radnoVremeRepository;

    public DataSeeder(KorisnikRepository korisnikRepository, PasswordEncoder passwordEncoder, LoyaltyProgramRepository loyaltyProgramRepository, RadnoVremeRepository radnoVremeRepository) {
        this.korisnikRepository = korisnikRepository;
        this.passwordEncoder = passwordEncoder;
        this.loyaltyProgramRepository = loyaltyProgramRepository;
        this.radnoVremeRepository = radnoVremeRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        createLoyaltyProgramIfNotFound("Nova zvezda", 0.0, 0);
        createLoyaltyProgramIfNotFound("Epizodista", 5.0, 100);
        createLoyaltyProgramIfNotFound("Glavna uloga", 10.0, 500);
        createLoyaltyProgramIfNotFound("Oscar za palačinke", 20.0, 1000);

        createKorisnikIfNotFound("admin@gmail.com", "admin123", "Admin Admin", Uloga.ADMIN, 2000);


        createKorisnikIfNotFound("radnik@gmail.com", "radnik123", "Petar Petrovic", Uloga.ZAPOSLENI, 0);

        createKorisnikIfNotFound("korisnik@gmail.com", "korisnik123", "Mile Kitic", Uloga.KORISNIK, 50);

        // Proizvodi se seeduju kroz Flyway migraciju V8__seed_meni.sql (pun meni, dev + prod).

        createRadnoVremeIfNotFound(DanUNedelji.PONEDELJAK, LocalTime.of(8, 0), LocalTime.of(23, 30));
        createRadnoVremeIfNotFound(DanUNedelji.UTORAK, LocalTime.of(8, 0), LocalTime.of(23, 30));
        createRadnoVremeIfNotFound(DanUNedelji.SREDA, LocalTime.of(8, 0), LocalTime.of(23, 30));
        createRadnoVremeIfNotFound(DanUNedelji.CETVRTAK, LocalTime.of(8, 0), LocalTime.of(23, 30));
        createRadnoVremeIfNotFound(DanUNedelji.PETAK, LocalTime.of(8, 0), LocalTime.of(23, 30));
        createRadnoVremeIfNotFound(DanUNedelji.SUBOTA, LocalTime.of(13, 0), LocalTime.of(23, 59));
        createRadnoVremeIfNotFound(DanUNedelji.NEDELJA, LocalTime.of(13, 0), LocalTime.of(23, 0));

    }


    private void createKorisnikIfNotFound(String email, String rawPassword, String ime, Uloga uloga,int brojBodova) {
        if (korisnikRepository.findByEmail(email).isEmpty()) {
            Korisnik noviKorisnik = new Korisnik();
            noviKorisnik.setEmail(email);
            noviKorisnik.setIme(ime);
            noviKorisnik.setLozinka(passwordEncoder.encode(rawPassword));
            noviKorisnik.setUloga(uloga);
            noviKorisnik.setBrojBodova(brojBodova);
            LoyaltyProgram pocetniNivo = loyaltyProgramRepository.findByNivo("Nova zvezda")
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Loyalty program 'Nova zvezda' ne postoji u bazi!"));

            noviKorisnik.setLoyaltyProgram(pocetniNivo);

            korisnikRepository.save(noviKorisnik);
            System.out.println("Kreiran korisnik: " + email + " sa ulogom " + uloga);
        }
    }

    private void createLoyaltyProgramIfNotFound(String nivo, double popust, int pragBodova) {
       if(loyaltyProgramRepository.findByNivo(nivo).isEmpty()){
           LoyaltyProgram noviloyaltyProgram = new LoyaltyProgram(nivo,popust,pragBodova);

           loyaltyProgramRepository.save(noviloyaltyProgram);
           System.out.println("Kreiran je loyalti nivo: " + nivo);
       }

    }

    private void createRadnoVremeIfNotFound(DanUNedelji dan, LocalTime odVremena, LocalTime doVremena) {
        if (radnoVremeRepository.findByDan(dan).isEmpty()) {
            RadnoVreme radnoVreme = new RadnoVreme(dan, odVremena, doVremena, true);
            radnoVremeRepository.save(radnoVreme);
            System.out.println("Kreirano radno vreme za dan: " + dan);
        }
    }
}
