-- Preimenovanje kategorija proizvoda (tip) iz internih kodova u prikazna imena.
-- V8 je seedovao meni sa velikim slovima (SLANA, SLATKA, ...); ovde ih lepimo na finalne nazive.
-- Idempotentno: ako je tip vec preimenovan, UPDATE ne pogadja nijedan red.

UPDATE proizvod SET tip = 'Slane'         WHERE tip = 'SLANA';
UPDATE proizvod SET tip = 'Slatke'        WHERE tip = 'SLATKA';
UPDATE proizvod SET tip = 'Premium kremovi' WHERE tip = 'PREMIUM_KREMOVI';
UPDATE proizvod SET tip = 'Pohovano'      WHERE tip = 'POHOVANO';
UPDATE proizvod SET tip = 'Giros'         WHERE tip = 'GIROS';
UPDATE proizvod SET tip = 'Salate'        WHERE tip = 'SALATE';
UPDATE proizvod SET tip = 'Sendviči'      WHERE tip = 'SENDVIČI';
UPDATE proizvod SET tip = 'Posno slano'   WHERE tip = 'POSNO_SLANO';
UPDATE proizvod SET tip = 'Posno slatko'  WHERE tip = 'POSNO_SLATKO';
UPDATE proizvod SET tip = 'Dodaci'        WHERE tip = 'DODACI';
UPDATE proizvod SET tip = 'Piće'          WHERE tip = 'PIĆE';
UPDATE proizvod SET tip = 'Žestoko'       WHERE tip = 'ŽESTOKO';
