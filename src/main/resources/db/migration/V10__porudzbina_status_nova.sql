-- Novi status NOVA (primljena, čeka prihvatanje) u životnom ciklusu porudžbine:
-- NOVA -> U_PRIPREMI -> SPREMNA -> REALIZOVANA (+ OTKAZANA).
-- Postojeći check constraint dozvoljava samo stare vrednosti, pa ga proširujemo.
ALTER TABLE porudzbine DROP CONSTRAINT IF EXISTS porudzbine_status_check;
ALTER TABLE porudzbine ADD CONSTRAINT porudzbine_status_check
    CHECK (status IN ('NOVA', 'U_PRIPREMI', 'SPREMNA', 'OTKAZANA', 'REALIZOVANA'));
