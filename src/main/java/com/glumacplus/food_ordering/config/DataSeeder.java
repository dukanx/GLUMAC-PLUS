package com.glumacplus.food_ordering.config;

import com.glumacplus.food_ordering.model.Korisnik;
import com.glumacplus.food_ordering.model.LoyaltyProgram;
import com.glumacplus.food_ordering.model.Proizvod;
import com.glumacplus.food_ordering.model.Uloga;
import com.glumacplus.food_ordering.repository.KorisnikRepository;
import com.glumacplus.food_ordering.repository.LoyaltyProgramRepository;
import com.glumacplus.food_ordering.repository.ProizvodRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.http.HttpStatus;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;

@Component
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

    private final KorisnikRepository korisnikRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoyaltyProgramRepository loyaltyProgramRepository;
    private final ProizvodRepository proizvodRepository;

    public DataSeeder(KorisnikRepository korisnikRepository, PasswordEncoder passwordEncoder, LoyaltyProgramRepository loyaltyProgramRepository, ProizvodRepository proizvodRepository) {
        this.korisnikRepository = korisnikRepository;
        this.passwordEncoder = passwordEncoder;
        this.loyaltyProgramRepository = loyaltyProgramRepository;
        this.proizvodRepository = proizvodRepository;
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


        createProizvodIfNotFound("Kinder Plazma Palačinka", BigDecimal.valueOf(350.0), "HRANA");
        createProizvodIfNotFound("Pohovana  Palačinka", BigDecimal.valueOf(480.0), "HRANA");
        createProizvodIfNotFound("Giros Pileći", BigDecimal.valueOf(420.0), "HRANA");
        createProizvodIfNotFound("Coca Cola 0.5", BigDecimal.valueOf(120.0), "PICE");
        createProizvodIfNotFound("Pistać Palačinka", BigDecimal.valueOf(450.0), "HRANA");

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
    private void createProizvodIfNotFound(String naziv, BigDecimal cena, String tip) {

       if( !proizvodRepository.existsByNazivAndTip(naziv,tip)){
           Proizvod p = new Proizvod();
           p.setNaziv(naziv);
           p.setCena(cena);
           p.setTip(tip);
           proizvodRepository.save(p);
           System.out.println("Kreiran proizvod: " + naziv);
       }

    }
}
