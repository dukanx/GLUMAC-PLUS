# Portfolio Backlog

## Backend — kritično

**✅ 0. Zaštita od duplih porudžbina + `/api/porudzbine/aktivna` endpoint — URAĐENO**
`PorudzbinaService.create()` ima proveru `existsByKorisnik_IdAndStatusIn` i baca 409 sa dogovorenom porukom; `GET /api/porudzbine/aktivna` postoji i `AktivnaPorudzbinaContext` ga koristi. Originalni opis ispod.
~~Trenutno `PorudzbinaService.create()` nema validaciju — korisnik može spamovati POST-ove i napraviti N istovremenih porudžbina u `U_PRIPREMI`. Takođe ne postoji način da frontend nakon refresha potvrdi da li je porudžbina iz `localStorage` još uvek aktivna.

Potrebno:
1. Repository: `existsByKorisnik_IdAndStatusIn(...)` i `findFirstByKorisnik_IdAndStatusInOrderByIdDesc(...)` za statuse `[U_PRIPREMI, SPREMNA]`.
2. Validacija u `PorudzbinaService.create()` — ako postoji aktivna, baci `409 CONFLICT` sa porukom "Već imaš aktivnu porudžbinu. Sačekaj da bude gotova pre nego što naručiš ponovo."
3. Novi endpoint `GET /api/porudzbine/aktivna` (KORISNIK role): vraća `AktivnaPorudzbinaDto(id, status, procenjenoVreme, tipPorudzbine)` ili `204 No Content`.
4. Frontend follow-up: `AktivnaPorudzbinaContext` poziva taj endpoint pri startup-u da validira ID iz `localStorage` (trenutno se slepo veruje storage-u, što može da pokaže "aktivnu" porudžbinu koja je već `REALIZOVANA`); CartDrawer i MiniKorpa hvataju 409 i prikazuju jasnu poruku.~~

**🟡 0b. Prepoznavanje da li je porudžbina već sačuvana kao omiljena**
Frontend trenutno prati "Sačuvano" stanje samo per-sesija (resetuje se na refresh) jer backend nema vezu omiljena → izvorna porudžbina. NE rešavati kao `boolean omiljena` na `Porudzbina` (ne hvata više omiljenih iz iste porudžbine + raspada se na brisanje omiljene). Umesto toga:
- Dodati `izvornaPorudzbinaId: Long` (nullable) na `OmiljenaPorudzbina`
- `GET /api/porudzbine/moje` (ili poseban endpoint) da vrati flag/skup ID-jeva koji su već sačuvani kao omiljeni
- Frontend onda trajno obeležava "Sačuvano" na karticama u istoriji

**🟡 0c. Dnevni redni broj porudžbine (umesto globalnog ID-a)**
`porudzbinaId` je globalni auto-increment PK — raste zauvek (#1, #2, ... #1547), pa brojevi postanu dugački i nezgodni za doviknuti kupcu. Dodati **dnevni redni broj** koji se resetuje svako jutro ("#42" = 42. porudžbina danas). Interni ID ostaje globalan; dodati polje tipa `dnevniBroj` na `Porudzbina` (računato pri kreiranju: broj porudžbina tog datuma + 1) i vraćati ga u `PorudzbinaViewDto`. Frontend (`PanelPorudzbina`, `StatusPorudzbine`) prikazuje dnevni broj umesto/pored globalnog ID-a.

**✅ 0d. Zaokruživanje novca na ceo dinar (konzistentno) — URAĐENO 2026-07-30**
Pravilo živi na po jednom mestu na svakoj strani: `util/Novac.java` (backend) i `utils/korpa.ts` (frontend), sa istim HALF_UP na ceo dinar. Zaokružuju se i linije računa (`iznosStavke`) i osnovica i finalni iznos, a **popust se nikad ne računa zasebno** nego kao razlika `originalnaCena − ukupanIznos`, pa jednakost važi bez ostatka. Rounding je pomeren u settere entiteta, tako da nijedan put u `Porudzbina`/`StavkaPorudzbine` ne može da unese decimalu. `NovacTest` prolazi kroz ~1200 kombinacija osnovice i procenta i proverava da se zbir uvek poklapa.
Migracija **V16** zaokružila je postojeće podatke (16 porudžbina je imalo `.50`); provereno da u bazi više nema ni jednog iznosa sa decimalom.
Odluka o prikazu: **kartice u meniju pokazuju punu cenu**, popust se vidi jednom, na ukupnom iznosu u korpi. Razlog nije estetski — panel prikazuje procenat popusta radnici da ga unese u kasu, a kasa računa popust na ukupan iznos. Da kartica pokazuje sniženu cenu po komadu, zbir komada (2 × 561 = 1122) ne bi odgovarao onome što kasa izbaci za 5% (1121). Loyalty bedž na vrhu menija i dalje najavljuje procenat.
Originalni opis: RSD nema podjedinicu, ali `ukupanIznos` izlazi sa .5 (npr. 5% od 590 = 560.5). Problem je i nekonzistentnost: meni računa `round(cena × 0.95)` = 561, korpa je računala `round(popust)` = 560 — `round(a−b) ≠ a − round(b)`. Pravilo mora biti JEDNO svuda: **zaokruži finalnu cenu** (`round(ukupnaCena × (1 − popust/100))`, `HALF_UP`), pa popust izvedi. Frontend preview (korpa) je već usklađen na to pravilo. Backend treba isto da zaokružuje `ukupanIznos` (i da se poklopi sa frontend preview-om), inače admin/istorija prikazuju .5.

**🟢 0e. Vreme prihvatanja / countdown za aktivne porudžbine — REŠENO client-side (backend opciono)**
Panel ima countdown za U_PRIPREMI (sada prikaz u minutima, Space Mono). Trenutna implementacija: start odbrojavanja se pamti **lokalno** (`localStorage: panel_vreme_start`, po porudžbini, stamp pri prihvatanju). Radi tačno i preko hard-reload-a (localStorage persistira) — potvrđeno u praksi 2026-07-23.
Backend verzija je potrebna SAMO ako: (a) panel se koristi na **više uređaja/tableta istovremeno** (localStorage se ne deli), ili (b) treba da preživi čišćenje storage-a / rad iz incognita. Tada dodati `vremePrihvatanja: LocalDateTime` (kad pređe U NOVA→U_PRIPREMI) ili `rokGotovo` na `Porudzbina` + `PorudzbinaViewDto`, i računati countdown od servera. Za sada nije prioritet.

**✅ 0f. BUG: `/api/porudzbine/moje` vraćao `List` umesto `Page` — URAĐENO**
`PorudzbinaController.getMyOrders` sada vraća `ResponseEntity<Page<PorudzbinaViewDto>>`, servis prosleđuje `Pageable` repozitorijumu. Pager u istoriji radi. Originalni opis ispod.
~~`getMyOrders` prima `page`/`size` i interno seče rezultat, ali vraća `List<PorudzbinaViewDto>` (ne `Page`). Posledica: frontend ne dobija `totalPages`/`totalElements`, pa IstorijaPage uvek misli da postoji 1 strana — pager se nikad ne prikaže. **Korisnik sa >8 porudžbina ne može da vidi 9. i dalje** (tihi bug; ne aktivira se dok ima malo porudžbina).
Fix: `/moje` da vraća `Page<PorudzbinaViewDto>` (kao što `/page` već radi — servis vrati `repo.findBy...(pageable)` umesto `.getContent()/.toList()`). Frontend NE treba menjati — `else` grana u `ucitaj` već hvata `content`/`totalPages`/`totalElements`.~~

**✅ 0g. Ime kupca u `PorudzbinaViewDto` za panel — URAĐENO 2026-07-31**
`korisnikIme` dodato u DTO i mapper; frontend nije menjan jer je već imao `{p.korisnikIme && ...}` u kartici i polje u tipu. Uz to `@BatchSize(size = 100)` na `Korisnik` — veza `Porudzbina.korisnik` je LAZY, pa bi bez toga ime značilo jedan upit po porudžbini (isti N+1 kao kod dodataka, vidi 0j). `PorudzbinaMapperTest` pokriva mapiranje imena i slučaj porudžbine bez korisnika.
Telefon nije dodat — `Korisnik` uopšte nema to polje; ono dolazi tek sa SMS slojem (migracija + DTO), pa je zaseban posao.

**🟢 0i. Testovi se kače na pravu (Neon) bazu — treba izolovana test konfiguracija (NIJE HITNO)**
Obim je uži nego što je prvo delovalo: **16 od 17 test klasa su čisti Mockito unit testovi** i uopšte ne diraju bazu. Pogađa samo `FoodOrderingApplicationTests`, jedini `@SpringBootTest`. Zato nije hitno, ali treba da postoji: svaki `mvn test` dodirne pravu bazu i troši ~12s samo na konekciju, a Flyway se pusti kao nusprodukt (tako su V14 i V15 ušle pre nego što su namerno puštene).
Ne postoji `src/test/resources/`, pa testovi koriste isti `application.properties` + `.env` kao aplikacija → `mvn test` se povezuje na **produkcionu Neon bazu**. Konkretno: `FoodOrderingApplicationTests` (diže ceo Spring context) pri svakom ranu pokrene Flyway na Neon-u — tako je V14 primenjena „usput", pre nego što je namerno puštena. Rizik: test-ran može da menja/zaključa pravu bazu, spor je (~10s samo na konekciju), i ne radi offline.
Fix: dodati `src/test/resources/application-test.properties` + `@ActiveProfiles("test")` (ili `application.properties` u test resources) sa H2 in-memory (`jdbc:h2:mem:...;MODE=PostgreSQL`) ili Testcontainers (`postgres:16`) ako treba pravi Postgres. Uz to `spring.flyway.enabled=true` da migracije prođu i na test bazi — ujedno postaje provera da migracije rade od nule. Unit testovi (Mockito) su već izolovani; ovo pogađa samo context/integracione testove.

**✅ 0h. Opisi proizvoda (`Proizvod.opis`) — URAĐENO 2026-07-31**
Ispravka polazne pretpostavke: polje **nije postojalo** na backendu (ni entitet, ni DTO, ni kolona) — samo TypeScript tip i tri komponente koje bi ga prikazale, pa je uvek bilo `undefined`.
Urađeno: **V17** dodaje kolonu `opis TEXT` (nullable), polje provučeno kroz `Proizvod`, `ProizvodViewDto`, `ProizvodDto` (`@Size(max=500)`) i `ProizvodMapper`; **V18** upisuje opise. Frontend nije menjan.
Opis dobija **13 od 167** stavki — samo one kojima naziv ne kaže sastav (Palačinka Glumac, Vegeterijana, Giros, salate, Dubai kadaif, Kifla tuna, Tortilja pileća bečka, Džem posni). Ostatak menija nabraja sastojke već u nazivu („Nutela, plazma, višnja") i namerno ostaje bez opisa, da kartica ne bi pisala isto dvaput. Iz istog razloga posne slane palačinke nemaju opis — njihov naziv *jeste* lista sastojaka.
Bez opisa su ostali i **Premium kremovi** (Krem pistać, Beli krem, Ferrero krem, Kinder Bueno krem) i **Prazna** — za njih sastav nije bio poznat. Dopuniti kad se zna — od faze 1 admin panela to je obično kucanje u formi, bez migracije.

**✅ 0n. Usklađivanje menija sa aktuelnim stanjem (V19) — URAĐENO 2026-07-31**
Migracija `V19__uskladi_meni_2026_07.sql`: **101 nova cena**, `Bel krem` → `Beli krem`, „Džem posni" podeljen na četiri palačinke (kajsija/šljiva/šipurak/jagoda, po 600) jer se ukus u lokalu bira usmeno a kroz aplikaciju nije imao gde da se unese, dodat `Tzatziki` (110) i četiri preliva kao dodaci sa prefiksom („Preliv jagoda"… — meni ima i dodatak „Jagode" i preliv „Jagoda", pa bi bez prefiksa bile dve iste stavke), sastojci sendviča prebačeni u `opis`. Baza je posle migracije proverena istom skriptom kojom je pravljen diff: **0 neslaganja** sa menijem.
Četiri stavke kojih više nema u ponudi (Spanać+sir+tartar, Šunka+sir+pavlaka+tartar, Jagoda krem, Džem posni) **ugašene su kao `DO_DALJNJEG`, ne obrisane** — „Spanać" je vezan za 2 porudžbine i 2 omiljene, pa bi brisanje pokidalo istoriju.

**✅ 0o. Dve vrste nedostupnosti se sad prikazuju različito — URAĐENO 2026-07-31**
Ranije je `ProizvodKartica` gledala samo `dostupan`, pa je i stavka skinuta sa ponude stajala na meniju uz „nema danas", poruku koja obećava povratak sutra.
Sad: `DO_KRAJA_SMENE` ostaje na meniju zasivljeno sa „nema danas" (danas je nestalo), a `DO_DALJNJEG` se **ne prikazuje uopšte**. Filter je predikat `uPonudi(p)` u `types/proizvod.ts`, primenjen u `MeniPage` i `HomePage`. Panel zaposlenog namerno **ne** koristi filter — obe vrste mora da vidi da bi mogao da ih vrati u ponudu.

**🔵 0q. Redni broj stavke na meniju (kao na štampanoj karti) — NIJE ODLUČENO**
Gosti u lokalu naručuju po broju sa štampane karte („daj mi peticu" = `Kajmak, pečenica, šunka, pavlaka, kačkavalj`, peta slana palačinka). U bazi taj broj ne postoji, pa se nigde ne može prikazati; numeracija u preporukama na početnoj je samo pozicija u listi i ne poklapa se sa kartom.
Ako se ikad radi: kolona `redniBroj` na `Proizvod` (po kategoriji, ne globalno) + prikaz uz naziv u meniju. Komplikacija je održavanje — brojevi se pomeraju kad se stavka doda ili skine, pa bi to trebalo da bude ručno polje u admin panelu, a ne izračunato.

**🟡 0p. Dodaci uz sendviče imaju svoje cene**
Meni navodi Krastavac 80, Paradajz 80, Jaje 90 uz sendviče, a `Krastavac` već postoji kao dodatak uz palačinke po 100; `Paradajz` i `Jaje` ne postoje. Model ima jednu cenu po dodatku, pa se to sad ne može predstaviti. Rešenje traži ili cenu dodatka po kategoriji, ili zasebne stavke tipa „Krastavac (sendvič)". Svesno preskočeno pri V19.

**🟡 0m. Refresh token (opoziv pristupa) — za produkciju, nije hitno**
Sada postoji jedan JWT koji i autentifikuje i drži sesiju, sa rokom od 30 dana (`JWT_EXPIRATION_MS=2592000000`, podignuto sa 24h 2026-07-28). Posledica: **pristup se ne može opozvati pre isteka.** Nema „odjavi me sa svih uređaja", izgubljen telefon ostaje prijavljen do 30 dana, a radnici koja ode iz lokala panel radi dok token ne istekne.
Fix: razdvojiti na kratak access token (~15 min, ide uz svaki zahtev) i dug refresh token (30 dana, čuva se u bazi, šalje se samo na `POST /api/auth/refresh`). Pošto refresh živi u bazi, može da se obriše — time se dobija opoziv. Potrebno: tabela `refresh_token(token PK, korisnik_id, istice, opozvan)`, endpoint za obnovu, rotacija pri svakoj upotrebi (da ukraden refresh ne radi paralelno sa pravim), i na frontendu presretanje 401 u `apiFetch` koje tiho obnovi token i ponovi pali zahtev umesto da odjavi.
Kad se ovo uradi, auto-logout iz `apiFetch` postaje krajnji slučaj (kad i refresh padne), a ne prva reakcija na 401.

**🟢 0l. Prava idempotentnost pri kreiranju porudžbine (`Idempotency-Key`) — NIJE HITNO**
Ono što danas postoji NIJE idempotentnost, nego poslovno pravilo „jedan aktivan nalog po korisniku": `PorudzbinaService.create()` proverava `existsByKorisnik_IdAndStatusIn` i baca 409. To pokriva glavni slučaj (dupli klik), ali ne i ovaj: prvi zahtev **uspe a odgovor se izgubi** (mreža pukne, tablet ispadne sa wifija). Klijent ponovi, dobije 409, kupac vidi grešku iako porudžbina postoji.
Prava idempotentnost: klijent šalje `Idempotency-Key` header (UUID po pokušaju naručivanja, isti kroz retry-jeve), server pamti ključ → id kreirane porudžbine i na ponovljeni zahtev vrati **istu** porudžbinu sa 200 umesto da baci 409. Tabela `idempotency_kljuc(kljuc PK, korisnik_id, porudzbina_id, kreirano)` uz čišćenje starijih od npr. 24h.
Prioritet nizak dok je lokal na stabilnom wifiju i dok je jedan tablet — rizik je izgubljen odgovor, ne dupla porudžbina. Pominjano na časovima iz .NET-a kao standardni obrazac za POST koji menja stanje.

**🟢 0k. Smena nema identitet u bazi — ručno „Zatvori smenu" ne preživi restart**
`SmenaStanje` ima samo `pauzirano`, bez datuma, a `biloOtvoreno` u `SmenaService` je polje u memoriji koje se resetuje pri svakom pokretanju. Zato prvi tik posle restarta ne može da razlikuje pauzu zaostalu od juče od one koju je radnica napravila pre deset minuta, pa je skine. Posledica: ručno zatvorena smena se sama „otvori" ako se backend restartuje u toku radnog vremena.
Fix: kolona `datum_smene DATE` na `smena_stanje` (migracija V16) kao identitet smene. U `automatskaSmena`: kad je otvoreno i `datumSmene != danas` → nova smena (vrati robu, skini pauzu, upiši datum); kad je `datumSmene == danas` → ista smena, ne dirati ništa. Time ručno zatvaranje preživi restart, a vraćanje robe „do kraja smene" se dešava tačno jednom po smeni bez oslanjanja na to da li je proces bio živ u trenutku zatvaranja (što je trenutno rešeno vraćanjem i na početku smene, vidi `SmenaServiceTest`).
Ograničenje koje treba imati u vidu: ako smena ikad pređe ponoć (npr. 20:00–02:00), datum se promeni usred smene. Tad umesto `DATE` pamtiti vreme početka smene.
Nije prioritet — pogađa samo scenario restarta usred ručno zatvorene smene.

**✅ 0r. Suvišni upiti na korisnicima (admin panel, sekcija Zaposleni) — URAĐENO 2026-08-01**
Mereno Hibernate statistikom, naizmenično po tri kruga (Neon jako varira, isti kod je davao 60–900 ms, pa je **broj upita dokaz, a vreme samo indikacija**).

| poziv | pre | posle |
|---|---|---|
| `GET /api/korisnici` (`getAll`) | 3 upita | **1** |
| `PATCH /{id}/uloga` (`updateUserRole`) | 5 upita, 2 transakcije | **3 upita, 1 transakcija** |

Tri uzroka, sva tri poučna:
1. **`Korisnik.loyaltyProgram` je `@ManyToOne` bez `fetch`, dakle EAGER.** Jedini takav u celom modelu — svi ostali imaju eksplicitan `fetch`. Rešeno `@EntityGraph`-om na `findAll()` i `findByEmail()`.
2. **`findById` i izveden upit se ne ponašaju isto.** `findById` ide preko `EntityManager.find()`, koji EAGER `@ManyToOne` spaja u isti `SELECT`. Izveden upit (`findByEmail`) to **ne** radi — vrati korisnika pa zasebnim upitom njegov loyalty program. Zato je `@EntityGraph` na `findByEmail` bio potreban, a na `findById` nije.
3. **`KorisnikService` je bio jedini servis bez ijednog `@Transactional`.** Posledica: svaki poziv repozitorijuma je svoja transakcija, pa je entitet iz `findById` do `save()` već bio **detached** — `save()` je onda radio `merge`, što znači dodatni `SELECT` pre `UPDATE`. Sa `@Transactional` entitet ostaje managed i `UPDATE` ide kroz dirty checking.

Ovo **nije** bio N+1 koji raste (za razliku od 0j): loyalty program se kešira u persistence contextu, pa je gornja granica bila `1 + broj različitih nivoa` bez obzira na broj korisnika. Bila su to prosto suvišna mrežna putovanja na svaki zahtev, jer svaki HTTP poziv dobija nov context.

Preostala tri upita u `updateUserRole` su `findByEmail` (prijavljeni admin), `findById` (meta) i `UPDATE`. Prvi bi se mogao izbaciti poređenjem e-maila iz `SecurityContext`-a sa e-mailom učitanog korisnika, ali **namerno nije** — `getCurrentUserEntity()` usput proverava da prijavljeni korisnik još postoji u bazi, pa bi izbacivanje značilo da obrisan nalog sa još važećim JWT-om prolazi.

**✅ 0j. N+1 upiti pri mapiranju porudžbina (stavke → dodaci) — URAĐENO 2026-07-27**
Rešeno sa `@BatchSize(size = 100)` na `StavkaPorudzbine.dodaci`, `OmiljenaPorudzbinaStavka.dodaci` i `OmiljenaPorudzbina.stavke` (konvencija je već postojala na `Porudzbina.stavke` i `Proizvod`). Mereno preko Hibernate `Statistics` na pravim podacima: istorija (8 porudžbina) **13 → 4 upita, 496 → 159 ms**; omiljene (7 sačuvanih) **24 → 3 upita, 865 → 108 ms**. Baza je Neon u Frankfurtu, RTT ~45–60 ms po upitu, pa je broj mrežnih putovanja bio ceo problem, ne količina podataka.
Opis problema (zadržan jer objašnjava zašto `@EntityGraph` nije bio rešenje):
`PorudzbinaMapper.toViewDto` čita `p.getStavke()` i `s.getDodaci()` lenjo. Stavke su bile pokrivene `@BatchSize`-om, ali dodaci (dodati uz feature dodataka) nisu — pa je svaka stavka slala poseban upit za svoje dodatke, i kad ih nema. Panel povlači `page?size=100`, pa bi pri punom danu (100 porudžbina × ~3 stavke) to bilo ~300 suvišnih upita po osvežavanju, a panel se osvežava periodično.
Zašto ne `@EntityGraph(attributePaths = {"stavke", "stavke.dodaci"})`: sa `Page` i fetch-om kolekcije Hibernate pređe na paginaciju u memoriji (`HHH000104`), što je gore od N+1. Alternativa bi bila strana ID-jeva (`Page<Long>`) pa `join fetch` za te ID-jeve, ali `@BatchSize` daje isti efekat bez ijedne izmene u upitima.
Isti obrazac je važio i za `/moje` (istorija kupca) i `findAllByStatus` — pokriveno istom izmenom.

---

## Frontend — po prioritetu

**✅ 1. Zameniti hardkodovane API URL-ove — URAĐENO**
Nigde više nema golog `http://localhost:8080`. Preostalih pet pojava (`api/client.ts`, `hooks/useRadnoVreme.ts`, `pages/IstorijaPage.tsx`, `pages/OmiljenePage.tsx`, `pages/PanelPorudzbina.tsx`) su oblika `import.meta.env.VITE_API_URL ?? 'http://localhost:8080'`, dakle env vrednost sa lokalnim fallback-om. Većina poziva ionako ide kroz `apiFetch` iz `api/client.ts`.
Eventualno kasnije: svesti i tih pet na jedan izvor (npr. izvezti `API` iz `api/client.ts`), ali to je kozmetika.

**✅ 2. Auto-logout na istekao token — URAĐENO**
Backend je prvo razdvojen: istekao/neispravan token daje **401**, a validan token bez dovoljne uloge **403** (ranije je oboje bilo 403, pa se nije moglo razlikovati). `apiFetch` u `api/client.ts` hvata 401 na zaštićenim pozivima i emituje `DOGADJAJ_SESIJA_ISTEKLA`; `AuthContext` ga sluša i odjavljuje. **403 se namerno NE hvata** — to nije istekla sesija nego korisnik koji nema pravo na tu stranu, i odjava bi ga zbunila.
Kad se uradi 0m (refresh token), 401 prvo pokušava tihu obnovu, pa tek onda odjavu.

<details><summary>3. Stilizovati preostale stranice u Calm Editorial dizajn — prevaziđeno</summary>

Stavka je iz vremena „Calm Editorial" pravca. Ceo frontend je u međuvremenu prebačen na **papirni rukopisni stil** (commit „redizajn frontenda u papirni rukopisni stil"), pa je ova podela stranica bespredmetna — sve su prošle kroz novi stil, uključujući `HomePage` i `LoyaltyPage` koje su ovde stajale kao neproverene.

</details>

**✅ 3. Dodati 404 stranicu — URAĐENO 2026-07-30**
`NotFoundPage.tsx` + `.module.css` u papirnom stilu (traka, veliki bledi "404", ispisana putanja koja je pokušana, linkovi na `/meni` i `/`), i `<Route path="*" element={<NotFoundPage />} />` kao poslednja ruta u `App.tsx`.
Napomena za produkciju: backend ne servira frontend, pa hosting `dist/`-a mora da radi SPA rewrite (svaki nepoznat put → `index.html`), inače korisnik dobije hostingov 404 pre nego što React uopšte krene.

**✅ 4. Show/hide lozinka na Login/Register — URAĐENO 2026-07-31**
Komponenta `components/PoljeLozinke.tsx` (label + input + oko + greška), koriste je `LoginPage` (jedno polje) i `RegisterPage` (dva, svako sa svojim stanjem — potvrda se otkriva nezavisno). Ikonice `Oko`/`OkoPrecrtano` dodate u `Doodle.tsx`. Dugme je `type="button"` da klik ne pošalje formu, sa `aria-label`/`aria-pressed` koji prate stanje.

**✅ 4b. Izvući dupliranu logiku kreiranja porudžbine — URAĐENO 2026-07-31**
Hook `hooks/usePorucivanje.ts` drži sve što je bilo duplirano: stanje (tip, napomena, slanje, potvrda, greška), računicu sa popustom i `POST /api/porudzbine`. `CartDrawer` i `MiniKorpa` su ostali samo prikaz — zajedno kraći za ~100 linija. Jedina razlika među njima ide kroz opciju `zatvori` (drawer je prosleđuje da bi se sam zatvorio pri odlasku na prijavu i posle potvrde, MiniKorpa nema šta da zatvori).

**🟢 5. Korpa i sessionStorage**
`mojaKorpa` se gubi zatvaranjem taba (`sessionStorage`). Razmotriti `localStorage` ako treba da traje između sesija.

**🔵 5b. Panel — AbortController umesto odbacivanja zastarelog refresh-a**
Race u `PanelPorudzbina.tsx`: auto-refresh GET pokrenut pre klika na akciju (Završi/Prihvati/Otkaži) vraćao se posle optimističkog update-a i vraćao staro stanje — kartica nestane pa se ponovo pojavi, treba drugi klik. Trenutni fix odbacuje rezultat ne-forsiranog fetch-a ako je akcija krenula nakon slanja zahteva (poređenje `poslednjaAkcija.current >= pokrenuto`). Ako to ne bude pouzdano, preći na pravi `AbortController` da se zastareli GET prekine umesto da samo ignorišemo odgovor — čistije, ali obimnije.

**🔵 6. Notifikacije — odloženo za mobilnu aplikaciju**
Backend ima ceo `Notifikacija` model + 6 tipova (`PORUDZBINA_PRIHVACENA`, `PORUDZBINA_VREME_PROMENJENO`, `PORUDZBINA_OTKAZANA`, `PROSLJENA_ZAVRSENA`, `LOYALTY_LEVEL_UP`, `RUCNO`), ali web frontend ih ne koristi. Push/in-app notifikacije će se raditi u sklopu mobilne aplikacije, ne na webu.

**✅ 7. Pretraga neosetljiva na srpska slova (dijakritika i pismo) — URAĐENO 2026-07-30**
Helper `src/utils/tekst.ts` (`normalizuj` + `sadrzi`): ćirilica se prvo preslovi u latinicu (digrafi љ→lj, њ→nj, џ→dz, ђ→dj), pa NFD skida kvačice sa ć/č/š/ž, a `đ` ide ručno na `dj` (NFD ga ne razlaže, zaseban je glif U+0111). Radi u oba smera — „шунка" nalazi „Šunka", „sunka" bi našlo i ćirilični naziv. Koriste ga `MeniPage` (kupac) i `PanelProizvodi` (panel) — pre toga je `MeniPage` imao svoju kopiju bez ćirilice, a panel je radio golo `toLowerCase().includes()`.
Ostalo za kasnije: backend `GET /api/proizvodi?q=` (`findByNazivContainingIgnoreCase...`) i dalje jeste osetljiv na dijakritiku, ali ga trenutno **ne zove nijedan klijent** (React filtrira lokalno, Angular i Android ga ne koriste). Ako pretraga ikad ode na server, treba `unaccent` ekstenzija u Postgresu ili normalizovana kolona.

**✅ 8. Animacije umesto tekstualnih „Učitavam…/Šaljem…" stanja — URAĐENO 2026-07-31**
`components/Ucitavanje.tsx`: `Tackice` (tri tačke koje poskakuju, nasleđuju `currentColor` pa rade i na tamnom dugmetu), `Spinner` (rukom povučen luk koji kruži) i podrazumevani `Ucitavanje` blok (spinner + tekst, `role="status"`). Provučeno kroz dugmad (prijava, registracija, naruči u draweru i MiniKorpi, sačuvaj u istoriji, ponovi u omiljenima, zatvori smenu) i blokove (panel, loyalty aktivnosti, radno vreme na početnoj i meniju, status porudžbine). Skeletoni koji su već postojali (meni, istorija, omiljene, lista dodataka) ostavljeni kakvi jesu. Uz `prefers-reduced-motion` animacije se gase, ali indikator ostaje vidljiv.

---

## Veliki feature-i (posle odbrane / pred produkciju)

### 🛠️ Admin panel — U TOKU (faze 0–3 i 5 gotove 2026-08-01)

Radi se po dizajnu iz `Website redesign concept (1)/design_handoff_glumac_plus/`, sekcija 9a.

**✅ Faza 0 — skelet.** `/admin` (`AdminPanel.tsx`), tamni sidebar 230px sa 8 sekcija i žutim levim borderom na aktivnoj, dole „vlasnik · ime" + odjava. Ruta traži prijavu, a sama strana proverava `uloga === 'ADMIN'` i vraća ostale na početnu. Navbar i floating dugme se sakrivaju na `/admin`. Na užem ekranu sidebar prelazi u traku na vrhu.

**✅ Faza 1 — MENI.** `components/admin/AdminMeni.tsx` + `ProizvodModal.tsx`: katalog grupisan po kategorijama, pretraga (radi i po opisu, koristi `sadrzi` pa hvata i ćirilicu), tabela sa cenom, alergenima i statusom, „+ NOVI PROIZVOD", izmena kroz modal (naziv, kategorija, cena, opis, ukus, alergeni), „sakrij"/„vrati". Desne kolone (alergeni, cena, status, akcije) su fiksne širine preko `colgroup` + `table-layout: fixed` — svaka sekcija je zasebna tabela, pa bi ih automatski raspored razvukao različito i poravnanje bi „igralo" između sekcija.
„Sakrij" postavlja `DO_DALJNJEG`, **ne briše** — brisanje bi palo na stranom ključu čim je proizvod jednom naručen.
Backend dopune uz ovo: `ProizvodDto` dobio `ukus` i `jedinicaMere` više nije obavezna (nijedan proizvod je nema, a `@NotBlank` bi blokirao čuvanje); `update()` sad postavlja i `opis` i `ukus` (ranije ih je ignorisao); `ProizvodViewDto` vraća i `alergeniIds` da forma zna šta je već izabrano; kreiranje/izmena/brisanje proizvoda **zaključani na ADMIN** (zaposlenom ostaje samo `/dostupnost`, tj. 86-lista u smeni).

**✅ Faza 2 — RADNO VREME + ZAPOSLENI.** `AdminRadnoVreme.tsx`: sedam dana, uključivanje/isključivanje radnog dana i sat od–do, čuvanje po redu (dugme se pali tek kad se red promeni). Menja se **stalni raspored**; jednokratno „danas ne radimo" ostaje u panelu zaposlenog (zatvaranje smene), i to piše ispod tabele da se ne traži na pogrešnom mestu.
Upozorenje kad nijedan dan nije radni: `RadnoVremeService.jeOtvorenoSada()` u tom slučaju vraća **`true`** (nema aktivnih intervala → „otvoreno"), pa bi lokal primao porudžbine 0–24. Blokira se i čuvanje kad su početak i kraj isti. Kraj pre početka je dozvoljen i označen kao „preko ponoći" — servis to podržava.
`AdminZaposleni.tsx`: lista onih koji imaju ADMIN/ZAPOSLENI, prebacivanje uloge i „ukloni pristup" (vraća na `KORISNIK`, ne briše nalog). Pristup se daje **postojećem nalogu preko e-maila** (`GET /api/korisnici/search`) jer backend nema kreiranje naloga sa ulogom — čovek se prvo registruje kao gost. Zaključano: sebi se uloga ne dira (zaključao bi se van panela) i poslednji ADMIN ne može da ostane bez uloge.
Stilovi su iz `AdminMeni.module.css` preseljeni u zajednički `Admin.module.css` — sekcija je od faze 2 više od jedne, pa je tabela/dugme/modal jedno mesto istine.

**✅ Faza 3 — KORISNICI.** Prva faza koja je tražila i backend: ni ispravka bodova ni blokiranje nisu postojali.
`AdminKorisnici.tsx`: svi nalozi, pretraga po imenu i e-mailu, filter „samo gosti", bodovi i nivo, blokiranje. Ispravka bodova ide kroz modal koji šalje **promenu, ne novo stanje** — dva istovremena dodavanja se tako sabiraju umesto da drugo pregazi prvo.
Nivo prati bodove **u oba smera**: pravilo je izvučeno u `util/LoyaltyNivo.java` i koriste ga i dodela pri preuzimanju porudžbine i ručna ispravka, pa ne mogu da se raziđu. Ako se bodovi smanje ispod praga, nivo pada.
Blokiranje (**V20**, kolona `blokiran`) važi **odmah, i za već izdate tokene**. `isEnabled()` sam nije dovoljan: `JwtAuthenticationFilter` ručno gradi authentication token, pa Spring ne proverava status naloga kao pri prijavi — provera je zato izričita u filteru. Bez toga bi blokiran korisnik radio do isteka JWT-a, dakle do 30 dana (isto ograničenje kao 0m). Dokazano privremenim MockMvc testom: isti token daje **200 pre blokade i 401 posle**.
Zaključano: sebe ne možeš blokirati (panel bi ostao bez ulaza, otključavao bi se samo ručno u bazi). Odblokiranje nema to ograničenje.
Blokiranje je namerno odvojeno od uloge — gost nema ulogu koju bi izgubio, pa mu se pristup drugačije ne može oduzeti. Nalog se ne briše, porudžbine i bodovi ostaju.

**Brzina panela — mereno 2026-08-01, protiv pravog backenda.**
Sekcije su se pri svakom povratku dohvatale iznova. `components/admin/kes.ts`: keširano se prikazuje odmah, a u pozadini se svejedno dohvata — ne samo radi svežine, nego zato što Korisnici i Zaposleni gledaju **istu listu**, pa bi bez toga izmena u jednoj ostala nevidljiva u drugoj. Keš je u modulu, ne u `localStorage`, pa se gubi na refresh (nema gledanja jučerašnjih cena). Radno vreme je **namerno** izostavljeno — to je forma sa neupisanim izmenama, koje bi osvežavanje u pozadini pregazilo.
Povratak na sekciju: Zaposleni 1303 → **37 ms**, Korisnici 833 → **78 ms**, Meni 1306 → **151 ms**. Prvo otvaranje ostaje ~800 ms i to se kodom ne skraćuje.

Gde vreme zapravo odlazi: ruta koja **ne dira bazu** odgovara za **1–6 ms**; `/api/alergeni` vraća 2 bajta a traje do 1181 ms, dok `/api/proizvodi` vraća 46 KB za ~700 ms. Dakle ne podaci i ne aplikacija. Samo TCP handshake do baze traje 247–498 ms, ali nije Neon kriv — `google.com:443` sa iste mašine daje 158–821 ms. **Veza ima visoku i neujednačenu latenciju**, što objašnjava zašto ista merenja variraju 60–900 ms. U produkciji, sa serverom blizu baze, ovo pada na skoro ništa; dotle svaki ušteđen upit vredi ~250 ms (vidi 0r).

**✅ Faza 5 — PORUDŽBINE (istorija).** `AdminPorudzbine.tsx` + `GET /api/porudzbine/pretraga` (ADMIN): pretraga po broju porudžbine ili kupcu, opseg datuma sa prečicama (danas / 7 / 30 dana), filter po statusu, straničenje i razlaganje porudžbine na stavke sa dodacima, načinom, popustom i napomenom gosta.
**Refundacija je izbačena iz obima.** Kroz aplikaciju ne prolazi nijedan dinar — nema integracije plaćanja, novac se naplaćuje na kasi. Aplikacija koja nikad nije naplatila ne može ni da vrati; posledicu (pogrešno dodeljeni bodovi) pokriva ručna ispravka iz faze 3. Stavka je bila nasleđena iz starog plana, ne iz potrebe.
Filtriranje je **na bazi**, ne u pregledaču, jer je rezultat straničen — sečenje posle dohvata dalo bi pogrešan broj strana.

**Dorada posle probe (2026-08-03).**
- **Pretraga zanemaruje kvačice i pismo.** `lower()` u SQL-u hvata samo velika i mala slova. Pravilo je postojalo samo na frontendu (`utils/tekst.ts`), pa je preneto u `util/Tekst.java` — mora biti isto, inače isti pojam daje različit rezultat u meniju i u panelu. Postgresov `unaccent` nije uzet: ne zna za ćirilicu i prevodi **đ** u „d" umesto u „dj". Poklapanje se radi u Javi nad šifarnicima (8 korisnika, ~180 proizvoda), pa se upitu prosleđuju samo pronađeni ID-jevi. **Ako korisnici narastu na hiljade, preći na normalizovan indeksiran stubac.**
- **Broj traži isključivo porudžbinu s tim brojem.** Ranije se broj tražio i u e-mailu kupca, pa je „78" izbacivalo i porudžbinu naloga `ng_test_1782846011@test.com` — rezultat koji se iz tabele ne može objasniti.
- **Pretraga hvata i naručene proizvode**, kroz `exists` podupit (ne join, koji bi umnožio porudžbinu sa više poklapajućih stavki).
- **Izvoz u CSV**: sve što odgovara filterima, ne samo tekuća strana. Razdvajač `;` jer Excel na srpskom podešavanju sa zarezom sve strpa u jednu ćeliju; BOM na početku da kvačice ne budu krš.
- Ceo red otvara detalje (i mišem i tastaturom), brze prečice za datum se vide kao aktivne, „poništi filtere" je pravo dugme uz brojač.
- **Ćorsokak na praznom rezultatu.** Traka sa brojačem i dugmetom „poništi filtere" stajala je unutar grane koja se crta samo kad ima redova — pa je nestajala tačno kad je najpotrebnija: pojam bez pogotka ostavljao je prazan ekran bez izlaza u jednom kliku. Traka se sad crta i za nula redova (brojač javlja „ništa ne odgovara filterima", CSV se sklanja jer nema šta da se izveze). **Pravilo: kontrola koja poništava stanje ne sme da živi u grani koja zavisi od tog stanja.**
- **Zamka na koju sam nasankao:** novu klasu za red tabele sam nazvao `.red`, a tako se već zvao *red polja u modalu* koji je `display: flex` — `<tr>` je prestao da bude red tabele i kolone su se raspale. Otkriveno merenjem položaja ćelija; test sad proverava da se kolone zaglavlja i tela poklapaju.

**Zašto `Specification`, a ne `@Query`.** Prvo napisan `@Query` sa opcionim uslovima oblika `(:param is null or ...)` **pada na Postgresu**: `ERROR: could not determine data type of parameter $3` (SQLState 42P18) — baza ne može da zaključi tip parametra koji se poredi sa NULL. `Specification` gradi upit samo od zadatih filtera, pa se problem i ne pojavi, a SQL je uz to uži. Otkriveno tek pokretanjem pravog backenda; kompajler i unit testovi to ne hvataju.
Razlaganje pojma i granice opsega su izvučeni u `util/FilterPorudzbina.java` da ostanu proverivi kao čista funkcija (7 testova) — kroz `Specification` se to teško ispituje. Tu je pokriveno i da je **kraj opsega uključiv** (šalje se početak sledećeg dana, inače porudžbina od 16:45 poslednjeg dana ispada iz rezultata).
Pojam više ne ide u SQL kao `LIKE`, pa nema ni bekstvovanja džokera: poređenje je u Javi (`Tekst.sadrzi`), a upitu se prosleđuju samo ID-jevi, kroz `in`. Time je otpao i raniji rizik da `_` u pojmu hvata bilo koje slovo.

**✅ Faza 6 — PREGLED (analitika).** `AdminPregled.tsx` + `GET /api/analitika/pregled` (samo ADMIN): promet, broj porudžbina, prosečna korpa i dat popust za period, grafikon prihoda po danima, najprodavaniji proizvodi i raspodela po statusima. Panel se sad otvara na Pregledu; ulazna sekcija je do sada bio Meni.

**Šta je uzeto sa grane `feature/analitika`, a šta prepravljeno.** Grana je pisana pre dodataka, popusta i statusa `NOVA`, pa je preneta ideja i oblik upita, ne kod:
- **`NOVA` je ispadala iz raspodele.** `switch` u `getStatusi` nije imao tu granu; kako je to `switch` *naredba* nad enumom, prevodilac ne traži iscrpnost — nepoklopljena vrednost prosto prođe. Nove porudžbine bi se tiho gubile i iz `ukupno`.
- **Novac je bio `double`.** Ostatak aplikacije računa u `BigDecimal` (vidi `util/Novac`), pa su DTO-ovi prepravljeni; `record` umesto klase sa geterima, po uzoru na `SmenaStatDto`.
- **Promet po proizvodu se sabirao kao `iznosStavke`**, a on po definiciji uključuje i dodatke — novac od eurokrema bio bi pripisan palačinci, a sam eurokrem se ne bi video. Sad su dva upita: `kolicina * cena` po stavkama i `d.kolicina * s.kolicina * d.cena` po dodacima, pa se spajaju po proizvodu. **Provereno na pravim podacima: zbir po proizvodima = prihod + popust, u dinar.**
- **`Object[]` kao povratni tip** za jednoredni zbir zamenjen je projekcijom sa imenovanim geterima.
- **Četiri endpointa svedena na jedan** (`/pregled`). Baza je u Frankfurtu, jedno putovanje ~50 ms; četiri poziva značila bi četiri čekanja pre nego što se stranica sklopi. Mereno: ceo pregled za 30 dana stiže za **~270 ms**.
- **Uloga:** grana je puštala i `ZAPOSLENI`. Ovde je promet celog lokala, pa je ostavljen samo `ADMIN`; zaposleni ima svoj dnevni sažetak kroz `/api/smena`.
- Dodato čega na grani nije bilo: prosečna korpa, ukupno dat popust, prihod po danima (za grafikon) i gornja granica perioda (366 dana).

**Dani bez prometa se popunjavaju u servisu.** Baza vraća samo dane u kojima nečega ima; da se to prosledilo kako jeste, grafikon bi spojio ponedeljak i četvrtak kao da su susedni.
**Grafikon je HTML, ne SVG.** U SVG-u sa `viewBox`-om skalira se sve, pa bi na širokom ekranu natpisi i debljine linija bili krupniji nego na uskom.
**Loš parametar više ne vraća 500.** `?od=juce` ili izostavljen `do` padali su u opšti hvatač i javljali „interna greška servera" za grešku koju je napravio klijent. `GlobalExceptionHandler` sad hvata `MissingServletRequestParameterException` i `MethodArgumentTypeMismatchException` → 400 sa jasnom porukom; isto važi i za pretragu porudžbina.

**Preostale faze:** ~~3 — korisnici (± bodovi, blokiranje)~~ · ~~5 — porudžbine (pretraga, opseg datuma, CSV)~~ · ~~6 — pregled/statistika~~ · 4 — loyalty (CRUD nivoa; kurs bodova je sad zakucan u servisu) · 7 — promo kodovi (nov entitet + integracija u cenu).

**🟡 Sitnica koju je faza 6 otkrila:** `SmenaService.statistika()` računa dnevni promet tako što **učita sve realizovane porudžbine** (`findAllByStatus`) pa filtrira u Javi. Radi dok ih je stotinak, ali raste zauvek. Sad postoji agregatni upit (`prihodZaPeriod`) koji to radi na bazi — zamena je nekoliko linija, ali dira panel zaposlenog, pa nije rađena uz analitiku.

**Napomene:** slike proizvoda su svesno preskočene (nema ni polja ni skladišta; meni koristi doodle placeholder). Prevlačenje reda za redosled takođe — vezano za 0q. U bazi trenutno **nema nijednog alergena**, pa se prvi pravi iz same forme („+ novi" uz alergene, gađa `POST /api/alergeni`).

**Kategorije proizvoda kao pravi šifarnik — kad bude vremena.**
`tip` je običan `String` na `Proizvod`; nema ni enum ni tabelu, kategorija „postoji" samo dok je neki proizvod nosi u toj koloni. Forma zato nudi `<select>` postojećih plus „+ nova kategorija…" — čuva od greške u kucanju, ali ne sprečava je: „Palacinke" pored „Palačinke" daje dve sekcije koje izgledaju isto. Gore od kozmetike — `Proizvod.TIP_DODACI = "Dodaci"` poredi **tačan tekst**, pa dodatak upisan kao „dodaci" prestaje da se ponaša kao dodatak i ispliva kupcu u meniju kao obična stavka.
Pravo rešenje: tabela `kategorija` (id, naziv, redosled) + migracija koja prebaci zatečene vrednosti, `tip` postane strani ključ, a redosled sekcija prestane da zavisi od abecede. Vezuje se sa 0q (brojevi stavki na meniju) — isti `redosled` bi služio i tome.

<details><summary>Originalni opis obima</summary>

Trenutno postoji samo **panel zaposlenog** (`/panel` = `PanelPorudzbina`, upravljanje porudžbinama uživo). Ne postoji admin panel za upravljanje **katalogom i konfiguracijom**. (Napomena: stari TODO/docs ponegde pominju "AdminPage" kao da postoji — NE postoji u kodu.)

**Obim (predlog):** zaseban ekran `/admin` (role ADMIN), odvojen od panela zaposlenog:
1. **Proizvodi (CRUD):** dodavanje/izmena/brisanje palačinki i ostalih stavki, cena, opis, kategorija (`tip`), slika. (Vezuje se sa "Popuniti opise" 0h i "Dostupnost" ispod.)
2. **Dostupnost proizvoda** — vidi zasebnu tačku ispod.
3. **Loyalty nivoi (CRUD):** pragovi + procenti popusta (trenutno seed-ovano).
4. **Radno vreme:** izmena `RadnoVreme` po danima.
5. **Korisnici / uloge:** pregled, promena uloge (već postoji `updateUserRole` na backendu sa `@PreAuthorize` ADMIN).
6. (Opciono) **Statistika / dashboard:** promet, broj porudžbina po statusu, popularne stavke, ušteđeno — može da povuče isti agregat kao `/loyalty/stats` ideja.

**Backend:** većina CRUD endpointa za `Proizvod`/`LoyaltyProgram`/`RadnoVreme` verovatno delom postoji (proveriti kontrolere) — treba upotpuniti + zaključati na ADMIN. Frontend je glavni posao.
</details>

### ✅ Dostupnost proizvoda ("86 lista") — URAĐENO 2026-07-23 (pun dizajn)
Zaposleni skida/vraća proizvode iz ponude preko **panela** (tab "PROIZVODI"). Implementirano prema dizajnu ("Panel zaposlenih" handoff).

**Backend (gotovo, kompajlira):**
- `Proizvod`: `boolean dostupan` (default true) + `RazlogNedostupnosti nedostupanRazlog` (enum: DO_KRAJA_SMENE / DO_DALJNJEG, null kad dostupan). Migracija `V11__proizvod_dostupan.sql` (dodaje obe kolone).
- `ProizvodViewDto`/`ProizvodDto`/`ProizvodMapper` propuštaju polja.
- `PATCH /api/proizvodi/{id}/dostupnost?dostupan=&razlog=` (ZAPOSLENI/ADMIN).
- `PorudzbinaService.create()` → **409** ako je stavka nedostupna.
- Smena: `SmenaService` + `SmenaController` — `GET /api/smena/pregled`, `POST /api/smena/zatvori` (vraća DO_KRAJA_SMENE proizvode + dnevna statistika: broj porudžbina, promet, prosečna priprema). `SmenaStatDto`.

**Frontend (gotovo, build prolazi):**
- Panel: prekidač ekrana "Porudžbine / Proizvodi". `PanelProizvodi.tsx` = 86-lista (pretraga, grupisano po tipu, ✓IMA/✗NEMA, izbor DO KRAJA SMENE / DO DALJNJEG / NAZAD, "Zatvori smenu" modal sa statistikom).
- Meni kupca (`ProizvodKartica`): nedostupno = zasivljeno + "nema danas" + disable dodavanja + precrtana cena.
- `api/proizvodi.setDostupnost`, `api/smena`.

**Automatsko + ručno otvaranje/zatvaranje smene (URAĐENO 2026-07-23):**
- **Auto:** `@EnableScheduling` + `SmenaService.automatskaSmena()` (`@Scheduled fixedRate=60s`), vezano za `RadnoVreme`. Prelaz u zatvoreno → vraća "do kraja smene" proizvode; prelaz u otvoreno → skida ručnu pauzu (nova smena). Detekcija prelaza preko `biloOtvoreno` (in-memory), safe na restart.
- **Ručna pauza (pravi override):** `SmenaStanje` entitet (jedan red, migracija `V12__smena_stanje.sql`) + `smena_stanje.pauzirano`. Endpoint-i `GET /api/smena/stanje`, `POST /api/smena/pauziraj`, `POST /api/smena/nastavi`. `PorudzbinaService.ensureRestaurantIsOpenNow()` → **400** ako je pauzirano (blokira i unutar radnog vremena). "Zatvori smenu" dugme sad i pauzira (kraj dana). Auto-otvaranje sledećeg dana skida pauzu.
- **Frontend:** panel header status ("prima porudžbine" / "pauzirano" / "van radnog vremena") + toggle "⏸ Pauziraj" / "▶ Nastavi" (poll na 15s).
- `PorudzbinaService` dobio `SmenaStanjeRepository` (test setup ažuriran, `PorudzbinaServiceTest` prolazi).

**⚠️ Za primenu:** restartovati backend da Flyway primeni `V11` + `V12` na Neon (i da scheduler krene).

### 🧇 Dodaci na palačinke (Wolt-stil konfigurator) — URAĐENO osim omiljenih (grana `dodaci`)
Stanje: model, migracije (V13 `ukus`, V14 `stavka_dodatak`), validacija, endpoint `/api/proizvodi/dodaci?ukus=`, konfigurator u detalju proizvoda, korpa po varijantama i prikaz u panelu/istoriji/statusu su gotovi. **Ostaje samo tačka 6 (omiljene) i „poruči ponovo" koji tiho izgubi dodatke** (`IstorijaPage.poruciPonovo` zove `dodaj(proizvod, s.kolicina)` bez dodataka — treba mapirati `s.dodaci` naziv→`Proizvod` iz kataloga). Umesto limita dogovoreno: bez limita, ali dodaci su podeljeni po `Ukus` (SLATKO/SLANO) pa slatki idu samo uz slatke palačinke.

Originalni plan (za istoriju):
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
5. Prikaz dodataka svuda gde se prikazuju stavke: korpa, CartDrawer, MiniKorpa, IstorijaPage, OmiljenePage, PanelPorudzbina, StatusPorudzbine. — urađeno svuda osim OmiljenePage (čeka tačku 6).
6. **PREOSTALO** — Omiljene: `OmiljenaPorudzbinaStavka` takođe mora da pamti dodatke (backend + front).

**Obim:** najveći feature u projektu — dira model, servis, korpa-arhitekturu i ~7 mesta prikaza. Raditi tek posle odbrane, u zasebnom branchu.

---

## 🟢 Kafka — minimalni event-driven demo (za odbranu)

**Cilj:** pokazati znanje event-driven arhitekture na JEDNOM realnom flow-u, korisno a ne overkill. Sve ostalo (login, meni, korpa) ostaje običan REST.

**Zašto baš ovde:** `PorudzbinaService.changeStatus()` trenutno radi sve sinhrono u jednoj metodi — i loyalty level-up obračun i pozive `notifikacijaService.createForUser(...)`. Kuhinja čeka da se sve to izvrši. To je idealna tačka za decoupling: servis upiše status u bazu i objavi event, a posledice (notifikacija + loyalty) obrade nezavisni consumer-i.

**Scope (minimalno):** promena statusa porudžbine → event → consumer(i) za notifikaciju + loyalty. Ništa više.

**Backend koraci:**
1. `pom.xml`: dodati `spring-kafka`. Lokalno Kafka kroz `docker-compose.yml` (Kafka + Zookeeper/KRaft) da demo radi bez instalacije.
2. `application.properties`: `spring.kafka.bootstrap-servers`, consumer group-id, JSON ser/deserializer, trusted packages.
3. Event DTO `PorudzbinaStatusPromenjenEvent(porudzbinaId, korisnikId, stariStatus, noviStatus, procenjenoVreme, timestamp)`.
4. Producer: u `changeStatus()` POSLE `porudzbinaRepo.save(p)` objaviti event na topic `porudzbina-status` sa **key = `porudzbinaId`** (ključno: garantuje redosled eventova po istoj porudžbini). Najbolje preko `@TransactionalEventListener(AFTER_COMMIT)` da se event ne pošalje ako transakcija padne.
5. Consumer-i (svaki svoja consumer-group):
   - `NotifikacijaListener` → na osnovu `noviStatus` pozove postojeći `notifikacijaService.createForUser(...)` (logika preseljena iz `changeStatus`).
   - `LoyaltyListener` → kad `noviStatus == REALIZOVANA`, odradi obračun poena/level-up (preseliti iz `changeStatus`); za level-up notifikaciju opet objavi event ili je consumer sam pošalje.
6. Retry + **dead-letter topic** (`porudzbina-status.DLT`) preko `DefaultErrorHandler` — ako notifikacija padne, poruka ide u DLT umesto da se izgubi. Ovo je glavni "reliability" talking-point za odbranu.

**Koncepti koje demo pokriva (za usmenu):** producer/consumer, topic, partition **key** za očuvanje redosleda, **consumer groups** (isti event obrade i notifikacija i loyalty nezavisno), retry + dead-letter, decoupling (kuhinja ne čeka).

**Šta SVESNO NE raditi (da ne bude overkill):** ne provlačiti kroz Kafka kreiranje porudžbine, login, čitanje menija; ne uvoditi Kafka Streams/KSQL; ne praviti više od jednog-dva topica.

**Veza:** ovo je konkretizacija tačke 4 ispod (Scalability). Outbox pattern (tačka 5) je sledeći logičan korak ako se traži potpuna pouzdanost producer-a, ali za demo je `@TransactionalEventListener(AFTER_COMMIT)` dovoljan.

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