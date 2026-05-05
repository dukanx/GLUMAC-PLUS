# Glumac Plus

Online sistem za naručivanje palačinki za istoimenu palačinkarnicu na Dorćolu, Beograd.

Korisnici mogu da pregledaju meni, naručuju i prate status porudžbine u realnom vremenu. Zaposleni upravljaju porudžbinama kroz namenski admin panel.

---

## Sadržaj

- [O projektu](#o-projektu)
- [Funkcionalnosti](#funkcionalnosti)
- [Tech stack](#tech-stack)
- [Arhitektura](#arhitektura)
- [Pokretanje](#pokretanje)
- [Build](#build)
- [API](#api)
- [Produkcija](#produkcija)

---

## O projektu

Glumac Plus je realan sistem razvijen za stvarnu upotrebu u ugostiteljskom objektu. Fokus projekta je na:

- real-time korisničkom iskustvu
- sigurnoj autentikaciji i autorizaciji
- jasnoj i robusnoj poslovnoj logici
- modularnoj i održivoj arhitekturi

---

## Funkcionalnosti

- pregled menija, alergena i radnog vremena
- registracija i prijava putem JWT autentikacije
- kreiranje i praćenje porudžbina u realnom vremenu
- loyalty sistem sa bodovima i nivoima pogodnosti
- istorija porudžbina i omiljene stavke
- admin panel za upravljanje porudžbinama
- sistem notifikacija za ključne događaje

---

## Tech stack

### Backend

| Tehnologija | Verzija |
|---|---|
| Java | 21 |
| Spring Boot | 3.x |
| Spring Security | — |
| Spring Data JPA | — |
| Flyway | — |
| PostgreSQL | — |

### Frontend

| Tehnologija | Verzija |
|---|---|
| React | 19 |
| TypeScript | — |
| Vite | — |
| React Router | — |

---

## Arhitektura

Aplikacija je organizovana kao odvojeni backend API i SPA frontend:

```
Frontend (React SPA)
        ↓
Backend API (Spring Boot)
        ↓
    PostgreSQL
```

### Autentikacija i sigurnost

- JWT-based autentikacija (stateless)
- BCrypt hashiranje lozinki
- Role-based pristup: `KORISNIK`, `ZAPOSLENI`, `ADMIN`
- kombinacija Security filtera i metodskih autorizacija (`@PreAuthorize`)

### Sistem porudžbina

Porudžbine prolaze kroz definisan state machine:

```
U_PRIPREMI → SPREMNA → REALIZOVANA
     ↓             ↓
 OTKAZANA      OTKAZANA
```

Sistem automatski:

- blokira naručivanje van radnog vremena
- primenjuje loyalty popuste
- dodeljuje bodove za porudžbinu
- unapređuje nivo korisnika

### Loyalty program

- bodovi se računaju proporcionalno potrošnji
- nivoi su konfigurabilni
- automatsko unapređenje nivoa
- notifikacija pri level-up-u

### Notifikacije

Notifikacije se generišu za:

- promenu statusa porudžbine
- otkazivanje porudžbine
- završetak porudžbine
- promenu vremena čekanja
- loyalty napredak

### Rukovanje greškama

Centralizovano rukovanje greškama sa uniformnim odgovorom:

```json
{
  "timestamp": 1714900000000,
  "status": 400,
  "message": "Validacija nije prošla",
  "path": "/api/korisnici",
  "errors": {
    "email": "mora biti ispravna e-mail adresa"
  }
}
```

---

## Pokretanje

### Preduslovi

- Java 21+
- Node.js 18+
- PostgreSQL

### 1. Kreiranje baze

```sql
CREATE DATABASE food_ordering;
```

### 2. Konfiguracija

```bash
cp .env.example .env
```

`.env` primer:

```env
SPRING_PROFILES_ACTIVE=dev
DB_URL=jdbc:postgresql://localhost:5432/food_ordering
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=REPLACE_WITH_BASE64_SECRET
JWT_EXPIRATION_MS=86400000
APP_CORS_ALLOWED_ORIGIN_PATTERNS=http://localhost:5173
APP_TIMEZONE=Europe/Belgrade
```

### 3. Backend

```bash
./mvnw spring-boot:run
```

Dostupan na: `http://localhost:8080`

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Dostupan na: `http://localhost:5173`

> Dev profil automatski učitava seed podatke.

---

## Build

### Backend

```bash
./mvnw clean package
```

### Frontend

```bash
cd frontend
npm ci
npm run build
```

---

## Struktura projekta

```
.
├── src/main/java/com/glumacplus/food_ordering/
│   ├── config/
│   ├── controller/
│   ├── dto/
│   ├── model/
│   ├── repository/
│   └── service/
├── src/main/resources/
│   ├── application.properties
│   └── db/migration/
├── frontend/
│   ├── src/
│   └── package.json
├── .env.example
└── pom.xml
```

---

## API

Zaštićeni endpointi zahtevaju JWT token u headeru:

```
Authorization: Bearer <token>
```

| Prefiks | Opis |
|---|---|
| `/api/auth` | registracija i prijava |
| `/api/korisnici` | upravljanje korisnicima |
| `/api/proizvodi` | pregled menija |
| `/api/alergeni` | pregled i upravljanje alergenima |
| `/api/radno-vreme` | radno vreme restorana |
| `/api/porudzbine` | kreiranje i praćenje porudžbina |
| `/api/omiljene-porudzbine` | omiljene porudžbine i brzo naručivanje |
| `/api/notifikacije` | korisničke notifikacije |
| `/api/loyalty_program` | loyalty sistem |

---

## Produkcija

Aplikacija koristi `prod` Spring profil sa sledećim podešavanjima:

- Flyway migracije aktivne
- Hibernate u `validate` modu — bez automatskih izmena šeme
- konfiguracija isključivo preko environment varijabli

Preporuke za deploy:

- HTTPS obavezan
- reverse proxy (nginx)
- sigurno čuvanje `JWT_SECRET`
- pravilno podešen CORS

---

## Testiranje

_(u toku)_

- JUnit testovi za servisni sloj
- validacija poslovne logike

---

## Planirana unapređenja

- WebSocket za real-time update bez polling-a
- prošireni admin analitički panel
- mobilna verzija / PWA
- online plaćanje