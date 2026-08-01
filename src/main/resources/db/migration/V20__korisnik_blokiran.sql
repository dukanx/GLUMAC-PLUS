-- Blokiranje naloga iz admin panela.
-- Bez ovoga jedini način da se nekome oduzme pristup bio je da mu se spusti
-- uloga, što ne pomaže kod običnog gosta — on ionako nema ulogu da izgubi.

ALTER TABLE korisnik
    ADD COLUMN IF NOT EXISTS blokiran BOOLEAN NOT NULL DEFAULT FALSE;
