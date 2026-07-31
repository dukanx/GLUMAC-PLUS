-- Usklađivanje sa aktuelnim menijem (stanje 2026-07-31).
-- Sadrži: nove cene, ispravku naziva, podelu posnog džema na četiri palačinke,
-- gašenje stavki kojih više nema u ponudi, nove dodatke i prelive,
-- i sastojke sendviča prebačene u opis.
-- Idempotentno: UPDATE-i su po (tip, naziv), INSERT-i imaju NOT EXISTS.


-- ─────────────────────────────────────────────────────────────
-- 1) NOVE CENE (101 stavka)
-- ─────────────────────────────────────────────────────────────

-- Giros
UPDATE proizvod SET cena = 670 WHERE tip = 'Giros' AND naziv = 'Giros pileći';  -- bilo 620
UPDATE proizvod SET cena = 300 WHERE tip = 'Giros' AND naziv = 'Pomfrit 200g';  -- bilo 290

-- Pohovano
UPDATE proizvod SET cena = 820 WHERE tip = 'Pohovano' AND naziv = 'Hrskavi pileći štapići 250g + tartar sos';  -- bilo 720
UPDATE proizvod SET cena = 630 WHERE tip = 'Pohovano' AND naziv = 'Pohovani kačkavalj, tartar sos';  -- bilo 580
UPDATE proizvod SET cena = 850 WHERE tip = 'Pohovano' AND naziv = 'Porcija pohovano belo';  -- bilo 730
UPDATE proizvod SET cena = 300 WHERE tip = 'Pohovano' AND naziv = 'Uštipci (4 kom)';  -- bilo 280

-- Posno slano
UPDATE proizvod SET cena = 640 WHERE tip = 'Posno slano' AND naziv = 'Pečurke, majonez, biljni kačkavalj, kečap';  -- bilo 540
UPDATE proizvod SET cena = 700 WHERE tip = 'Posno slano' AND naziv = 'Tunjevina, biljni kačkavalj, kiseli krastavac, zelena salata, posni majonez, kukuruz';  -- bilo 600

-- Posno slatko
UPDATE proizvod SET cena = 670 WHERE tip = 'Posno slatko' AND naziv = 'Posni Eurokrem Takovo, keks';  -- bilo 570

-- Premium kremovi
UPDATE proizvod SET cena = 600 WHERE tip = 'Premium kremovi' AND naziv = 'Bel krem';  -- bilo 550
UPDATE proizvod SET cena = 600 WHERE tip = 'Premium kremovi' AND naziv = 'Ferrero krem';  -- bilo 550
UPDATE proizvod SET cena = 600 WHERE tip = 'Premium kremovi' AND naziv = 'Kinder Bueno krem';  -- bilo 550
UPDATE proizvod SET cena = 700 WHERE tip = 'Premium kremovi' AND naziv = 'Krem pistać';  -- bilo 620

-- Sendviči
UPDATE proizvod SET cena = 400 WHERE tip = 'Sendviči' AND naziv = 'Kifla kulen';  -- bilo 340
UPDATE proizvod SET cena = 400 WHERE tip = 'Sendviči' AND naziv = 'Kifla pečenica';  -- bilo 340
UPDATE proizvod SET cena = 400 WHERE tip = 'Sendviči' AND naziv = 'Kifla pečenica urnebes';  -- bilo 340
UPDATE proizvod SET cena = 450 WHERE tip = 'Sendviči' AND naziv = 'Kifla tuna';  -- bilo 390
UPDATE proizvod SET cena = 400 WHERE tip = 'Sendviči' AND naziv = 'Kifla šunka';  -- bilo 320
UPDATE proizvod SET cena = 500 WHERE tip = 'Sendviči' AND naziv = 'Tortilja pileća bečka';  -- bilo 450

-- Slane
UPDATE proizvod SET cena = 800 WHERE tip = 'Slane' AND naziv = 'Giros palačinka';  -- bilo 720
UPDATE proizvod SET cena = 650 WHERE tip = 'Slane' AND naziv = 'Kajmak, kačkavalj';  -- bilo 570
UPDATE proizvod SET cena = 800 WHERE tip = 'Slane' AND naziv = 'Kajmak, pečenica, šunka, pavlaka, kačkavalj';  -- bilo 700
UPDATE proizvod SET cena = 800 WHERE tip = 'Slane' AND naziv = 'Kulen, pavlaka, jaje, krastavac';  -- bilo 680
UPDATE proizvod SET cena = 730 WHERE tip = 'Slane' AND naziv = 'Kulen, pavlaka, kačkavalj';  -- bilo 650
UPDATE proizvod SET cena = 800 WHERE tip = 'Slane' AND naziv = 'Palačinka Glumac';  -- bilo 690
UPDATE proizvod SET cena = 780 WHERE tip = 'Slane' AND naziv = 'Palačinka Piletina';  -- bilo 690
UPDATE proizvod SET cena = 850 WHERE tip = 'Slane' AND naziv = 'Palačinka sa goveđom pršutom';  -- bilo 740
UPDATE proizvod SET cena = 600 WHERE tip = 'Slane' AND naziv = 'Pavlaka, kačkavalj';  -- bilo 550
UPDATE proizvod SET cena = 650 WHERE tip = 'Slane' AND naziv = 'Pavlaka, kačkavalj, kajmak';  -- bilo 580
UPDATE proizvod SET cena = 600 WHERE tip = 'Slane' AND naziv = 'Pavlaka, pečurke';  -- bilo 550
UPDATE proizvod SET cena = 700 WHERE tip = 'Slane' AND naziv = 'Pečenica, kajmak, kačkavalj';  -- bilo 620
UPDATE proizvod SET cena = 720 WHERE tip = 'Slane' AND naziv = 'Pečenica, pavlaka, kačkavalj';  -- bilo 620
UPDATE proizvod SET cena = 750 WHERE tip = 'Slane' AND naziv = 'Pečenica, šunka, pavlaka, kačkavalj';  -- bilo 630
UPDATE proizvod SET cena = 650 WHERE tip = 'Slane' AND naziv = 'Pečurke, pavlaka, kačkavalj';  -- bilo 580
UPDATE proizvod SET cena = 650 WHERE tip = 'Slane' AND naziv = 'Vegeterijana';  -- bilo 570
UPDATE proizvod SET cena = 650 WHERE tip = 'Slane' AND naziv = 'Šunka, pavlaka, kačkavalj';  -- bilo 590

-- Slatke
UPDATE proizvod SET cena = 800 WHERE tip = 'Slatke' AND naziv = 'Dubai kadaif palačinka';  -- bilo 720
UPDATE proizvod SET cena = 450 WHERE tip = 'Slatke' AND naziv = 'Džem jagoda';  -- bilo 420
UPDATE proizvod SET cena = 450 WHERE tip = 'Slatke' AND naziv = 'Džem kajsija';  -- bilo 420
UPDATE proizvod SET cena = 450 WHERE tip = 'Slatke' AND naziv = 'Džem šljiva';  -- bilo 420
UPDATE proizvod SET cena = 550 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo';  -- bilo 500
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, banana';  -- bilo 550
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, banana, suvo grožđe';  -- bilo 580
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, kokos';  -- bilo 550
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, kokos, banana';  -- bilo 590
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, kokos, suvo grožđe';  -- bilo 580
UPDATE proizvod SET cena = 700 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, lešnik, ananas';  -- bilo 620
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, orasi';  -- bilo 580
UPDATE proizvod SET cena = 700 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, orasi, banana';  -- bilo 620
UPDATE proizvod SET cena = 700 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, orasi, kokos';  -- bilo 590
UPDATE proizvod SET cena = 700 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, orasi, suvo grožđe';  -- bilo 590
UPDATE proizvod SET cena = 600 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, plazma';  -- bilo 540
UPDATE proizvod SET cena = 680 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, plazma, banana';  -- bilo 600
UPDATE proizvod SET cena = 680 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, plazma, kokos';  -- bilo 600
UPDATE proizvod SET cena = 720 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, plazma, malina';  -- bilo 630
UPDATE proizvod SET cena = 680 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, plazma, orasi';  -- bilo 600
UPDATE proizvod SET cena = 680 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, plazma, suvo grožđe';  -- bilo 590
UPDATE proizvod SET cena = 700 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, plazma, višnja';  -- bilo 620
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, plazma-mleko';  -- bilo 560
UPDATE proizvod SET cena = 630 WHERE tip = 'Slatke' AND naziv = 'Eurokrem Takovo, suvo grožđe';  -- bilo 550
UPDATE proizvod SET cena = 550 WHERE tip = 'Slatke' AND naziv = 'Jagoda, orasi';  -- bilo 480
UPDATE proizvod SET cena = 580 WHERE tip = 'Slatke' AND naziv = 'Jagoda, orasi, suvo grožđe';  -- bilo 490
UPDATE proizvod SET cena = 550 WHERE tip = 'Slatke' AND naziv = 'Kajsija, orasi';  -- bilo 480
UPDATE proizvod SET cena = 580 WHERE tip = 'Slatke' AND naziv = 'Kajsija, orasi, suvo grožđe';  -- bilo 490
UPDATE proizvod SET cena = 500 WHERE tip = 'Slatke' AND naziv = 'Med';  -- bilo 450
UPDATE proizvod SET cena = 550 WHERE tip = 'Slatke' AND naziv = 'Med, banana';  -- bilo 460
UPDATE proizvod SET cena = 580 WHERE tip = 'Slatke' AND naziv = 'Med, banana, suvo grožđe';  -- bilo 490
UPDATE proizvod SET cena = 550 WHERE tip = 'Slatke' AND naziv = 'Med, orasi';  -- bilo 490
UPDATE proizvod SET cena = 580 WHERE tip = 'Slatke' AND naziv = 'Med, orasi, suvo grožđe';  -- bilo 490
UPDATE proizvod SET cena = 530 WHERE tip = 'Slatke' AND naziv = 'Med, suvo grožđe';  -- bilo 460
UPDATE proizvod SET cena = 550 WHERE tip = 'Slatke' AND naziv = 'Nutela';  -- bilo 500
UPDATE proizvod SET cena = 600 WHERE tip = 'Slatke' AND naziv = 'Nutela, banana';  -- bilo 550
UPDATE proizvod SET cena = 670 WHERE tip = 'Slatke' AND naziv = 'Nutela, banana, suvo grožđe';  -- bilo 580
UPDATE proizvod SET cena = 600 WHERE tip = 'Slatke' AND naziv = 'Nutela, kokos';  -- bilo 580
UPDATE proizvod SET cena = 670 WHERE tip = 'Slatke' AND naziv = 'Nutela, kokos, banana';  -- bilo 580
UPDATE proizvod SET cena = 670 WHERE tip = 'Slatke' AND naziv = 'Nutela, kokos, suvo grožđe';  -- bilo 580
UPDATE proizvod SET cena = 700 WHERE tip = 'Slatke' AND naziv = 'Nutela, lešnik, ananas';  -- bilo 620
UPDATE proizvod SET cena = 600 WHERE tip = 'Slatke' AND naziv = 'Nutela, orasi';  -- bilo 580
UPDATE proizvod SET cena = 670 WHERE tip = 'Slatke' AND naziv = 'Nutela, orasi, banana';  -- bilo 620
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Nutela, orasi, kokos';  -- bilo 600
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Nutela, orasi, suvo grožđe';  -- bilo 600
UPDATE proizvod SET cena = 600 WHERE tip = 'Slatke' AND naziv = 'Nutela, plazma';  -- bilo 540
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Nutela, plazma, banana';  -- bilo 600
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Nutela, plazma, kokos';  -- bilo 600
UPDATE proizvod SET cena = 720 WHERE tip = 'Slatke' AND naziv = 'Nutela, plazma, malina';  -- bilo 630
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Nutela, plazma, orasi';  -- bilo 600
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Nutela, plazma, suvo grožđe';  -- bilo 600
UPDATE proizvod SET cena = 700 WHERE tip = 'Slatke' AND naziv = 'Nutela, plazma, višnja';  -- bilo 620
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Nutela, plazma-mleko';  -- bilo 560
UPDATE proizvod SET cena = 600 WHERE tip = 'Slatke' AND naziv = 'Nutela, suvo grožđe';  -- bilo 550
UPDATE proizvod SET cena = 650 WHERE tip = 'Slatke' AND naziv = 'Nutela, višnja';  -- bilo 580
UPDATE proizvod SET cena = 250 WHERE tip = 'Slatke' AND naziv = 'Prazna';  -- bilo 240
UPDATE proizvod SET cena = 280 WHERE tip = 'Slatke' AND naziv = 'Šećer';  -- bilo 250
UPDATE proizvod SET cena = 480 WHERE tip = 'Slatke' AND naziv = 'Šećer, orasi';  -- bilo 400
UPDATE proizvod SET cena = 500 WHERE tip = 'Slatke' AND naziv = 'Šećer, orasi, banane';  -- bilo 460
UPDATE proizvod SET cena = 500 WHERE tip = 'Slatke' AND naziv = 'Šećer, orasi, suvo grožđe';  -- bilo 460
UPDATE proizvod SET cena = 450 WHERE tip = 'Slatke' AND naziv = 'Šipurak';  -- bilo 420
UPDATE proizvod SET cena = 550 WHERE tip = 'Slatke' AND naziv = 'Šipurak, orasi';  -- bilo 450
UPDATE proizvod SET cena = 580 WHERE tip = 'Slatke' AND naziv = 'Šipurak, orasi, suvo grožđe';  -- bilo 490
UPDATE proizvod SET cena = 550 WHERE tip = 'Slatke' AND naziv = 'Šljiva, orasi';  -- bilo 470
UPDATE proizvod SET cena = 580 WHERE tip = 'Slatke' AND naziv = 'Šljiva, orasi, suvo grožđe';  -- bilo 490


-- ─────────────────────────────────────────────────────────────
-- 2) ISPRAVKA NAZIVA
-- ─────────────────────────────────────────────────────────────
-- Na meniju piše "Beli krem"; cena je već postavljena gore, pod starim nazivom.
UPDATE proizvod SET naziv = 'Beli krem'
    WHERE tip = 'Premium kremovi' AND naziv = 'Bel krem';


-- ─────────────────────────────────────────────────────────────
-- 3) POSNI DŽEM — jedna stavka postaje četiri
-- ─────────────────────────────────────────────────────────────
-- U lokalu gost usmeno kaže koji džem hoće, ali kroz aplikaciju to nema gde da se
-- unese. Zato se "Džem posni" gasi, a svaki ukus postaje svoja palačinka.
INSERT INTO proizvod (naziv, tip, cena, ukus, dostupan, kalorije, proteini, masti, ugljeni_hidrati)
SELECT v.naziv, 'Posno slatko', 600, 'SLATKO', TRUE, 0, 0, 0, 0
FROM (VALUES
    ('Džem posni kajsija'),
    ('Džem posni šljiva'),
    ('Džem posni šipurak'),
    ('Džem posni jagoda')
) AS v(naziv)
WHERE NOT EXISTS (
    SELECT 1 FROM proizvod p WHERE p.naziv = v.naziv AND p.tip = 'Posno slatko'
);

-- Opis (spisak ukusa) više nema smisla kad su ukusi zasebne stavke.
UPDATE proizvod SET opis = NULL, dostupan = FALSE, nedostupan_razlog = 'DO_DALJNJEG'
    WHERE tip = 'Posno slatko' AND naziv = 'Džem posni';


-- ─────────────────────────────────────────────────────────────
-- 4) STAVKE KOJIH VIŠE NEMA U PONUDI
-- ─────────────────────────────────────────────────────────────
-- Ne brišu se: "Spanać, sir, tartar sos" je vezan za postojeće porudžbine i
-- omiljene, pa bi brisanje pokidalo istoriju. Gase se kao nedostupne — nestaju
-- iz menija kupca, a u panelu ostaju na 86-listi i vraćaju se jednim tapom.
UPDATE proizvod SET dostupan = FALSE, nedostupan_razlog = 'DO_DALJNJEG'
    WHERE (tip = 'Pohovano' AND naziv IN ('Spanać, sir, tartar sos', 'Šunka, sir, pavlaka, tartar sos'))
       OR (tip = 'Premium kremovi' AND naziv = 'Jagoda krem');


-- ─────────────────────────────────────────────────────────────
-- 5) NOVI DODACI I PRELIVI
-- ─────────────────────────────────────────────────────────────
-- Tzatziki je jedini dodatak sa menija koji nije postojao u bazi.
-- Prelivi idu kao dodaci (ne kao svoja kategorija) jer se biraju uz palačinku,
-- a ne naručuju sami. Prefiks "Preliv" ih razdvaja od svežeg voća — meni ima i
-- dodatak "Jagode" i preliv "Jagoda", što bi u listi bile dve iste stavke.
INSERT INTO proizvod (naziv, tip, cena, ukus, dostupan, kalorije, proteini, masti, ugljeni_hidrati)
SELECT v.naziv, 'Dodaci', v.cena, v.ukus, TRUE, 0, 0, 0, 0
FROM (VALUES
    ('Tzatziki', 110, 'SLANO'),
    ('Preliv šumsko voće', 100, 'SLATKO'),
    ('Preliv karamela', 100, 'SLATKO'),
    ('Preliv čokolada', 100, 'SLATKO'),
    ('Preliv jagoda', 100, 'SLATKO')
) AS v(naziv, cena, ukus)
WHERE NOT EXISTS (
    SELECT 1 FROM proizvod p WHERE p.naziv = v.naziv AND p.tip = 'Dodaci'
);


-- ─────────────────────────────────────────────────────────────
-- 6) SASTOJCI SENDVIČA U OPIS
-- ─────────────────────────────────────────────────────────────
-- Naziv ostaje kratak da kartica bude pregledna; sastav ide u opis, isto kao
-- kod "Palačinke Glumac". Time se i ne menja kako izgledaju već naručene stavke
-- u istoriji, jer one čitaju živi naziv proizvoda.
UPDATE proizvod SET opis = 'kulen, pavlaka, kačkavalj, zelena salata, jaje, paradajz'
    WHERE tip = 'Sendviči' AND naziv = 'Kifla kulen';
UPDATE proizvod SET opis = 'šunka, pavlaka, kačkavalj, zelena salata'
    WHERE tip = 'Sendviči' AND naziv = 'Kifla šunka';
UPDATE proizvod SET opis = 'pečenica, pavlaka, kačkavalj, zelena salata, paradajz'
    WHERE tip = 'Sendviči' AND naziv = 'Kifla pečenica';
UPDATE proizvod SET opis = 'pečenica, urnebes, zelena salata, jaje, paradajz'
    WHERE tip = 'Sendviči' AND naziv = 'Kifla pečenica urnebes';
