-- Opis proizvoda — kratak sastav za stavke kojima naziv ne kaže šta je unutra
-- ("Palačinka Glumac"). Većina menija nabraja sastojke već u nazivu
-- ("Nutela, plazma, višnja") i ostaje bez opisa, zato je kolona nullable.
-- Idempotentno: dev profil ume da pusti Hibernate ddl-auto pre Flyway-a.

ALTER TABLE proizvod ADD COLUMN IF NOT EXISTS opis TEXT;
