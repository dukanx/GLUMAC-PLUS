-- Dostupnost proizvoda ("86 lista"): zaposleni može stavku da označi kao (ne)dostupnu.
-- dostupan = efektivni flag (meni/naručivanje); nedostupan_razlog = zašto (za panel + zatvaranje smene).
-- Postojeći proizvodi su podrazumevano dostupni.
ALTER TABLE proizvod
    ADD COLUMN dostupan boolean NOT NULL DEFAULT true;

ALTER TABLE proizvod
    ADD COLUMN nedostupan_razlog varchar(32);
