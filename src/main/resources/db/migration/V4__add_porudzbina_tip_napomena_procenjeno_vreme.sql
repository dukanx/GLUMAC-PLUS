ALTER TABLE porudzbine
    ADD COLUMN napomena TEXT;

ALTER TABLE porudzbine
    ADD COLUMN tip_porudzbine VARCHAR(50);

UPDATE porudzbine
SET tip_porudzbine = 'ZA_PONETI'
WHERE tip_porudzbine IS NULL;

ALTER TABLE porudzbine
    ALTER COLUMN tip_porudzbine SET NOT NULL;

ALTER TABLE porudzbine
    ADD COLUMN procenjeno_vreme INTEGER;

CREATE INDEX idx_porudzbine_tip_porudzbine ON porudzbine(tip_porudzbine);
