-- RSD nema podjedinicu, pa pola dinara nije moglo ni da se naplati — na kasi je
-- ionako uzet ceo dinar. Decimale su nastale množenjem loyalty popustom
-- (npr. 590 x 0.95 = 560.50), pa se zaokružuju da baza odgovara naplaćenom.
--
-- Zaokruživanje je HALF_UP, isto pravilo kao u Novac.zaokruzi i utils/korpa.ts.
-- Popust se ne dira jer se nikad ne čuva zasebno — izvodi se kao
-- originalna_cena - ukupan_iznos, i ostaje tačan i posle zaokruživanja.

UPDATE porudzbine
SET ukupan_iznos = round(ukupan_iznos)
WHERE ukupan_iznos <> round(ukupan_iznos);

UPDATE porudzbine
SET originalna_cena = round(originalna_cena)
WHERE originalna_cena IS NOT NULL
  AND originalna_cena <> round(originalna_cena);

UPDATE stavka_porudzbine
SET iznos_stavke = round(iznos_stavke)
WHERE iznos_stavke <> round(iznos_stavke);

UPDATE stavka_dodatak
SET cena = round(cena)
WHERE cena <> round(cena);
