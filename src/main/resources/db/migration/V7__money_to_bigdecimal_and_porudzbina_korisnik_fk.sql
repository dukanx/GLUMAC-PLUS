ALTER TABLE proizvod
    ALTER COLUMN cena TYPE NUMERIC(12, 2)
    USING ROUND(cena::numeric, 2);

ALTER TABLE porudzbine
    ALTER COLUMN ukupan_iznos TYPE NUMERIC(12, 2)
    USING ROUND(ukupan_iznos::numeric, 2);

ALTER TABLE porudzbine
    ALTER COLUMN originalna_cena TYPE NUMERIC(12, 2)
    USING ROUND(originalna_cena::numeric, 2);

ALTER TABLE stavka_porudzbine
    ALTER COLUMN cena TYPE NUMERIC(12, 2)
    USING ROUND(cena::numeric, 2);

ALTER TABLE stavka_porudzbine
    ALTER COLUMN iznos_stavke TYPE NUMERIC(12, 2)
    USING ROUND(iznos_stavke::numeric, 2);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_porudzbine_korisnik'
    ) THEN
        ALTER TABLE porudzbine
            ADD CONSTRAINT fk_porudzbine_korisnik
            FOREIGN KEY (korisnik_id) REFERENCES korisnik(id);
    END IF;
END $$;
