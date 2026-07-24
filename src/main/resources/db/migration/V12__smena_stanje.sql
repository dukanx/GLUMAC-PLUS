-- Živo stanje smene (jedan red): ručna pauza primanja porudžbina.
-- Automatsko otvaranje po radnom vremenu skida pauzu.
CREATE TABLE smena_stanje (
    id        bigint  PRIMARY KEY,
    pauzirano boolean NOT NULL DEFAULT false
);

INSERT INTO smena_stanje (id, pauzirano) VALUES (1, false);
