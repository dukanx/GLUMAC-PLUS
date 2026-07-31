-- Opisi za stavke kojima naziv ne govori sastav. Preuzeto sa aktuelnog menija.
-- Ostatak ponude nabraja sastojke već u nazivu ("Nutela, plazma, višnja"),
-- pa im opis namerno ostaje NULL — inače bi kartica pisala isto dvaput.
-- Idempotentno: ponovljeno puštanje samo upiše iste vrednosti.

-- Slane
UPDATE proizvod SET opis = 'pečurke, pavlaka, paradajz, kukuruz, krastavac'
    WHERE naziv = 'Vegeterijana';
UPDATE proizvod SET opis = 'pečenica, šunka, kulen, kačkavalj, pavlaka, ajvar, susam, zelena salata'
    WHERE naziv = 'Palačinka Glumac';
UPDATE proizvod SET opis = 'belo meso, kiseli krastavac, pavlaka, majonez, kurkuma'
    WHERE naziv = 'Palačinka Piletina';
UPDATE proizvod SET opis = 'pileće meso, kačkavalj, tzatziki, pomfrit, luk (150 g mesa)'
    WHERE naziv = 'Giros palačinka';
UPDATE proizvod SET opis = 'goveđa pršuta, topljeni sir, feta, krastavac'
    WHERE naziv = 'Palačinka sa goveđom pršutom';

-- Slatke
UPDATE proizvod SET opis = 'pistać krem, nutela, kadaif, lešnik'
    WHERE naziv = 'Dubai kadaif palačinka';

-- Sendviči
UPDATE proizvod SET opis = 'tunjevina, kiseli krastavac, kukuruz, zelena salata'
    WHERE naziv = 'Kifla tuna';
UPDATE proizvod SET opis = 'pohovano belo meso, susam, zelena salata, paradajz, pavlaka'
    WHERE naziv = 'Tortilja pileća bečka';

-- Salate
UPDATE proizvod SET opis = 'paradajz, krastavac, masline, kukuruz, zelena salata'
    WHERE naziv = 'Vegeterijanska velika';
UPDATE proizvod SET opis = 'pileće belo, paradajz, zelena salata, krastavac, kupus, kukuruz'
    WHERE naziv = 'Pileća velika';
UPDATE proizvod SET opis = 'feta sir, masline, paradajz, zelena salata, krastavac'
    WHERE naziv = 'Grčka velika';

-- Giros
UPDATE proizvod SET opis = 'pileći bataci, tzatziki, pomfrit, paradajz, luk (140 g mesa)'
    WHERE naziv = 'Giros pileći';

-- Posno slatko (posne slane palačinke već imaju sastav u nazivu)
UPDATE proizvod SET opis = 'kajsija, šljiva, šipurak ili jagoda'
    WHERE naziv = 'Džem posni';
