# Portfolio Backlog

## Backend — kritično

**🔴 0. Zaštita od duplih porudžbina + `/api/porudzbine/aktivna` endpoint**
Trenutno `PorudzbinaService.create()` nema validaciju — korisnik može spamovati POST-ove i napraviti N istovremenih porudžbina u `U_PRIPREMI`. Takođe ne postoji način da frontend nakon refresha potvrdi da li je porudžbina iz `localStorage` još uvek aktivna.

Potrebno:
1. Repository: `existsByKorisnik_IdAndStatusIn(...)` i `findFirstByKorisnik_IdAndStatusInOrderByIdDesc(...)` za statuse `[U_PRIPREMI, SPREMNA]`.
2. Validacija u `PorudzbinaService.create()` — ako postoji aktivna, baci `409 CONFLICT` sa porukom "Već imaš aktivnu porudžbinu. Sačekaj da bude gotova pre nego što naručiš ponovo."
3. Novi endpoint `GET /api/porudzbine/aktivna` (KORISNIK role): vraća `AktivnaPorudzbinaDto(id, status, procenjenoVreme, tipPorudzbine)` ili `204 No Content`.
4. Frontend follow-up: `AktivnaPorudzbinaContext` poziva taj endpoint pri startup-u da validira ID iz `localStorage` (trenutno se slepo veruje storage-u, što može da pokaže "aktivnu" porudžbinu koja je već `REALIZOVANA`); CartDrawer i MiniKorpa hvataju 409 i prikazuju jasnu poruku.

**🟡 0b. Prepoznavanje da li je porudžbina već sačuvana kao omiljena**
Frontend trenutno prati "Sačuvano" stanje samo per-sesija (resetuje se na refresh) jer backend nema vezu omiljena → izvorna porudžbina. NE rešavati kao `boolean omiljena` na `Porudzbina` (ne hvata više omiljenih iz iste porudžbine + raspada se na brisanje omiljene). Umesto toga:
- Dodati `izvornaPorudzbinaId: Long` (nullable) na `OmiljenaPorudzbina`
- `GET /api/porudzbine/moje` (ili poseban endpoint) da vrati flag/skup ID-jeva koji su već sačuvani kao omiljeni
- Frontend onda trajno obeležava "Sačuvano" na karticama u istoriji

**🟡 0c. Dnevni redni broj porudžbine (umesto globalnog ID-a)**
`porudzbinaId` je globalni auto-increment PK — raste zauvek (#1, #2, ... #1547), pa brojevi postanu dugački i nezgodni za doviknuti kupcu. Dodati **dnevni redni broj** koji se resetuje svako jutro ("#42" = 42. porudžbina danas). Interni ID ostaje globalan; dodati polje tipa `dnevniBroj` na `Porudzbina` (računato pri kreiranju: broj porudžbina tog datuma + 1) i vraćati ga u `PorudzbinaViewDto`. Frontend (AdminPage, StatusPorudzbine) prikazuje dnevni broj umesto/pored globalnog ID-a.

**🟠 0d. Zaokruživanje novca na ceo dinar (konzistentno)**
RSD nema podjedinicu, ali `ukupanIznos` izlazi sa .5 (npr. 5% od 590 = 560.5). Problem je i nekonzistentnost: meni računa `round(cena × 0.95)` = 561, korpa je računala `round(popust)` = 560 — `round(a−b) ≠ a − round(b)`. Pravilo mora biti JEDNO svuda: **zaokruži finalnu cenu** (`round(ukupnaCena × (1 − popust/100))`, `HALF_UP`), pa popust izvedi. Frontend preview (korpa) je već usklađen na to pravilo. Backend treba isto da zaokružuje `ukupanIznos` (i da se poklopi sa frontend preview-om), inače admin/istorija prikazuju .5.

**🟡 0e. Vreme prihvatanja / countdown za aktivne porudžbine**
Panel treba countdown za porudžbine u pripremi ("ostalo ~mm:ss"). Za to treba znati KAD je prihvaćena — trenutno DTO daje samo `datum` (kreiranje). Dodati na `Porudzbina` + `PorudzbinaViewDto` ili `vremePrihvatanja: LocalDateTime` (kad pređe u SPREMNA) ili direktno `rokGotovo: LocalDateTime` (= vremePrihvatanja + procenjenoVreme). Frontend onda tika svake sekunde i crveni kad istekne.

**🔴 0f. BUG: `/api/porudzbine/moje` vraća `List` umesto `Page` — nepristupačne porudžbine**
`getMyOrders` prima `page`/`size` i interno seče rezultat, ali vraća `List<PorudzbinaViewDto>` (ne `Page`). Posledica: frontend ne dobija `totalPages`/`totalElements`, pa IstorijaPage uvek misli da postoji 1 strana — pager se nikad ne prikaže. **Korisnik sa >8 porudžbina ne može da vidi 9. i dalje** (tihi bug; ne aktivira se dok ima malo porudžbina).
Fix: `/moje` da vraća `Page<PorudzbinaViewDto>` (kao što `/page` već radi — servis vrati `repo.findBy...(pageable)` umesto `.getContent()/.toList()`). Frontend NE treba menjati — `else` grana u `ucitaj` već hvata `content`/`totalPages`/`totalElements`.

**🟡 0g. Ime kupca (i telefon) u `PorudzbinaViewDto` za panel**
Panel zaposlenog bi trebalo da prikaže ime kupca ("čija je porudžbina"). Frontend je već spreman (`{p.korisnikIme && ...}` u kartici), ali DTO ne sadrži `korisnikIme`. Dodati `korisnikIme` (i opciono `brojTelefona`) u `PorudzbinaViewDto` — proradiće bez frontend izmene.

**🟡 0h. Popuniti opise proizvoda (`Proizvod.opis`)**
`Proizvod` u modelu ima polje `opis`, ali je prazno/null za većinu (Glumac, Dubai palačinka...). Zbog toga MeniPage (ProizvodKartica) i HomePage preporuke nemaju šta da prikažu kao opis. Popuniti opise kroz seed/admin (npr. "Eurokrem, plazma, višnja"). Frontend je već spreman da ih prikaže čim postoje.

---

## Frontend — po prioritetu

**🔴 1. Zameniti hardkodovane API URL-ove**
`http://localhost:8080` je direktno upisan u 8 fajlova. Treba kreirati `.env.local` sa `VITE_API_URL=http://localhost:8080` i koristiti `import.meta.env.VITE_API_URL` svuda (kao što `LoyaltyPage` i `IstorijaPage` već rade).
Fajlovi koji još imaju hardkodovan URL: `AuthContext.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `MeniPage.tsx`, `CartDrawer.tsx`, `MiniKorpa.tsx`, `StatusPorudzbine.tsx`.
Već koriste `API` env var (obrazac za kopirati): `IstorijaPage.tsx`, `OmiljenePage.tsx`, `AdminPage.tsx`.

**🔴 2. Auto-logout na istekao token (401/403)**
Trenutno kada JWT istekne, zaštićeni pozivi vrate 403 i frontend samo prikaže sirovu grešku ("Forbidden" / "Nije moguće učitati..."). Treba centralno hvatanje 401/403 → `logout()` + redirect na `/login` sa porukom "Sesija je istekla, prijavite se ponovo." Najčistije kroz wrapper oko `fetch` (npr. `apiFetch` helper) ili interceptor. Pogađa sve zaštićene pozive (porudžbine, omiljene, /me...).

**🟢 3. Stilizovati preostale stranice u Calm Editorial dizajn**
Sve glavne korisničke/admin stranice gotove: `MeniPage`, `IstorijaPage`, `OmiljenePage`, `AdminPage`. (Proveriti još `HomePage` i `LoyaltyPage` da li su usklađene.)

**🟡 3. Dodati 404 stranicu**
Nema fallback rute — pogrešan URL vraća praznu stranicu.
Fix: `<Route path="*" element={<NotFoundPage />} />` na kraj ruta u `App.tsx`.

**🟡 4. Show/hide lozinka na Login/Register**
Password inputi nemaju dugme za prikaz lozinke.

**🟠 4b. Izvući dupliranu logiku kreiranja porudžbine**
`handleNaruci` u `CartDrawer.tsx` i `MiniKorpa.tsx` su skoro identični (isti `POST /api/porudzbine`, isti payload `{tipPorudzbine, napomena, stavke}`, isti `otvoriStatus`). Razlikuju se samo u UX-u (drawer se zatvara / prikaz greške kroz `alert` vs `setGreska`). Izvući mrežni poziv u helper (npr. `kreirajPorudzbinu(token, payload)` u `src/api/` ili `usePorudzbina()` hook), a svaka komponenta zadrži svoj UX. Uklanja pravu duplikaciju. (Zajednički `TipPorudzbine`/`TIP_LABELE` su već izvučeni u `src/types/porudzbina.ts`.)

**🟢 5. Korpa i sessionStorage**
`mojaKorpa` se gubi zatvaranjem taba (`sessionStorage`). Razmotriti `localStorage` ako treba da traje između sesija.

**🔵 5b. Panel — AbortController umesto odbacivanja zastarelog refresh-a**
Race u `PanelPorudzbina.tsx`: auto-refresh GET pokrenut pre klika na akciju (Završi/Prihvati/Otkaži) vraćao se posle optimističkog update-a i vraćao staro stanje — kartica nestane pa se ponovo pojavi, treba drugi klik. Trenutni fix odbacuje rezultat ne-forsiranog fetch-a ako je akcija krenula nakon slanja zahteva (poređenje `poslednjaAkcija.current >= pokrenuto`). Ako to ne bude pouzdano, preći na pravi `AbortController` da se zastareli GET prekine umesto da samo ignorišemo odgovor — čistije, ali obimnije.

**🔵 6. Notifikacije — odloženo za mobilnu aplikaciju**
Backend ima ceo `Notifikacija` model + 6 tipova (`PORUDZBINA_PRIHVACENA`, `PORUDZBINA_VREME_PROMENJENO`, `PORUDZBINA_OTKAZANA`, `PROSLJENA_ZAVRSENA`, `LOYALTY_LEVEL_UP`, `RUCNO`), ali web frontend ih ne koristi. Push/in-app notifikacije će se raditi u sklopu mobilne aplikacije, ne na webu.

---

## Veliki feature-i (posle odbrane / pred produkciju)

### 🧇 Dodaci na palačinke (Wolt-stil konfigurator)
Trenutno su palačinke fiksne komponovane stavke. Cilj: zadržati gotove palačinke, ali dozvoliti kupcu da doda **opcione ekstra dodatke**, svaki sa svojom cenom — kao Wolt:
```
Nutela, plazma, višnja              RSD 820
Izaberi ekstra dodatak (do N):
  ▢ Kokos      +110     ▢ Orasi    +110
  ▢ Eurokrem   +140     ▢ Višnje   +130   ...
```
Dodaci su `Proizvod` sa `tip = "dodaci"` (već postoje u bazi), samo se sada vezuju za stavku umesto da idu samostalno.

**Zašto ne može frontend sam:** `StavkaPorudzbine` ima jedan `proizvodId`. Ako se dodaci pošalju kao zasebne stavke, gubi se veza "koji dodatak ide na koju palačinku" (problem kad ima više palačinki). Grupisanje MORA na backend.

**Backend:**
1. Novi entitet `StavkaDodatak` (ili kolekcija na `StavkaPorudzbine`): `stavka_id` (parent), `proizvod_id` (dodatak, tip=dodaci), `kolicina`, `cena` (snapshot u trenutku porudžbine).
2. Cena stavke = `(bazaProizvod.cena + Σ dodatak.cena) × kolicina`. Ažurirati `iznosStavke` i `ukupanIznos`.
3. POST `/api/porudzbine` DTO: `stavke: [{ proizvodId, kolicina, dodaci: [{ proizvodId, kolicina }] }]`.
4. `PorudzbinaViewDto` stavke vraćaju i listu dodataka (naziv + cena) za prikaz u panelu/istoriji/statusu.
5. (Opciono) `ProizvodDodatak` join — ako neki dodaci smeju samo na neke palačinke; ako su svi dodaci globalni, preskočiti i samo dohvatati sve `Proizvod` gde `tip=dodaci`.
6. (Opciono) `maxDodataka` limit po palačinki.

**Frontend:**
1. Konfigurator modal: klik na palačinku u meniju → modal sa listom dodataka (checkbox + cena), "Ne, hvala" default, prikaz uživo zbira → "Dodaj u korpu".
2. `CartContext` stavka mora da nosi izabrane dodatke (ne više samo `{proizvod, kolicina}` — sada `{proizvod, dodaci[], kolicina}`); dve iste palačinke sa različitim dodacima su **različite stavke** u korpi.
3. Preračun cene u korpi (baza + dodaci), uskladiti sa zaokruživanjem (TODO 0d).
4. POST payload nosi `dodaci` po stavci.
5. Prikaz dodataka svuda gde se prikazuju stavke: korpa, CartDrawer, MiniKorpa, IstorijaPage, OmiljenePage, PanelPorudzbina, StatusPorudzbine.
6. Omiljene: `OmiljenaPorudzbinaStavka` takođe mora da pamti dodatke (backend + front).

**Obim:** najveći feature u projektu — dira model, servis, korpa-arhitekturu i ~7 mesta prikaza. Raditi tek posle odbrane, u zasebnom branchu.

---

## Scalability & Reliability

1. Dodati paginaciju, sortiranje i filtriranje za endpointe `omiljene-porudzbine` (Page response umesto List).
2. Uvesti optimistic locking (`@Version`) na `Porudzbina` i `Korisnik` + mapiranje konflikata na `409 Conflict`.
3. Uvesti idempotency key za `POST /api/porudzbine` i endpoint za ponavljanje porudzbine.
4. Uvesti asinhrone notifikacije preko message queue sistema (RabbitMQ/Kafka) sa retry i dead-letter mehanizmom.
5. Primeniti outbox pattern za pouzdano slanje dogadjaja ka spoljnim servisima (SMS/email/event bus).
6. Dodati observability: trace/span korelaciju, metrike i strukturisane logove.
7. Dodati load testing scenario (k6/JMeter) i kratku analizu bottleneck-a.

1.
feat: dodata polja za SMS na korisniku
•
brojTelefona (E.164 format) + opcionalno smsOptIn (default true/false, kako želiš).
•
Flyway migracija + DTO/mapper/service update (KorisnikDto, KorisnikMeUpdateDto, KorisnikViewDto).
2.
feat: uveden SMS sloj (abstrakcija + config)
•
SmsSender interfejs.
•
NoopSmsSender kad je sms.enabled=false.
•
SmsProperties (sms.enabled, sms.provider, kredencijali).
3.
feat: integracija SMS u tok notifikacija porudzbine
•
U istim mestima gde već šalješ app notifikacije (prihvaćena, promenjeno vreme, otkazana, završena) iz PorudzbinaService.java, pozove se i SMS servis.
•
Ako korisnik nema broj ili je smsOptIn=false, samo preskoči SMS bez greške.
4.
feat: implementiran provider (Twilio ili Infobip)
•
Prvo jedan provider da zatvorimo end-to-end.
•
Drugi može kasnije kao poseban commit.
5.
test: testovi za SMS flow
•
Unit testovi za servis (mock sender), plus minimum validacioni test za telefon.





Kreni seriju commitova za testove po modulima: Korisnik/Auth, Porudzbina, Notifikacija, OmiljenaPorudzbina, Alergen/RadnoVreme.

Posle svakog test-commita dodaj Javadoc za isti modul (controller + service + ključni DTO/repo metodi).

Na kraju jedan “stabilization” commit: sitne refakture, cleanup warninga, i tag za verziju pred predaju.