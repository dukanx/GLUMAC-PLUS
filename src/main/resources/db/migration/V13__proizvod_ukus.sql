-- Ukus proizvoda: za poklapanje dodataka sa palačinkama (slatki uz slatke, slani uz slane).
-- Palačinke dobijaju ukus po kategoriji (tip); dodaci po nazivu; piće/žestoko ostaju NULL.
-- IF NOT EXISTS: kolonu je možda već napravio Hibernate (dev ddl-auto=update);
-- backfill ispod svejedno popunjava vrednosti (kolona je do tad NULL).
ALTER TABLE proizvod ADD COLUMN IF NOT EXISTS ukus varchar(16);

-- Slatke kategorije
UPDATE proizvod SET ukus = 'SLATKO'
    WHERE tip IN ('Slatke', 'Posno slatko', 'Premium kremovi');

-- Slane kategorije
UPDATE proizvod SET ukus = 'SLANO'
    WHERE tip IN ('Slane', 'Posno slano', 'Giros', 'Pohovano', 'Salate', 'Sendviči');

-- Dodaci — slatki
UPDATE proizvod SET ukus = 'SLATKO'
    WHERE tip = 'Dodaci' AND naziv IN (
        'Kokos', 'Plazma', 'Suvo grožđe', 'Banane', 'Orasi', 'Kikiriki', 'Lešnik', 'Badem',
        'Jagode', 'Nutela', 'Ananas', 'Maline', 'Višnje', 'Eurokrem', 'Šlag', 'Sladoled vanila', 'Puding'
    );

-- Dodaci — preostali su slani (Masline, Pečurke, Tartar, Urnebes, Pavlaka, Kulen,
-- Krastavac, Tunjevina, Piletina, Goveđa pršuta ...).
UPDATE proizvod SET ukus = 'SLANO'
    WHERE tip = 'Dodaci' AND ukus IS NULL;
