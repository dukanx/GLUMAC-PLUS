# React ↔ Angular ↔ Android — poređenje implementacija (TKI)

Dokument prati **istu aplikaciju** (Glumac Plus — naručivanje palačinki) implementiranu u
**tri tehnologije**. Backend (Spring Boot) je isti; sve tri verzije gađaju iste REST endpointe.

- **React verzija:** `frontend/` — gotova, predata.
- **Angular verzija:** `frontend-angular/` — vertikalni isečak korisničkog toka.
- **Android verzija:** `glumacplusandroid/` — native, **Kotlin + Jetpack Compose**, isti isečak
  (Login/Register → Meni → Korpa/Naručivanje → Status → Istorija).

Cilj poređenja: pokazati kako se **isti koncepti UI tehnologija** rešavaju u sva tri alata,
sloj po sloj. Za detaljne mapiranje Android-a vidi sekciju **„Android — Kotlin + Jetpack Compose"** niže.

---

## Inventar Angular projekta

| Sloj | Fajlovi | Status |
|---|---|---|
| Bootstrap/config | `main.ts`, `app/app.config.ts`, `app/app.routes.ts`, `environments/environment.ts`, `app/app.component.*` | gotovo |
| Dizajn (globalno) | `styles.css` (Calm Editorial tokeni + Google Fonts) | gotovo |
| Modeli | `core/models/{korisnik,proizvod,porudzbina}.model.ts` | gotovo |
| Servisi | `core/services/{auth,cart,proizvod,porudzbina}.service.ts` | gotovo |
| Guard | `core/guards/auth.guard.ts` | gotovo |
| Komponente | `components/{navbar,proizvod-kartica,cart-drawer,status-porudzbine,floating-bubble}/` | gotovo |
| Stranice | `pages/{login,register,meni,istorija}/` | gotovo |
| Servis (stanje) | `core/services/aktivna-porudzbina.service.ts` | gotovo |

**Vertikalni isečak je kompletan:** Register → Login → Meni → Korpa → Naručivanje → Status → Istorija.

**Arhitektonski potpis Angular verzije:** standalone komponente, `inject()`, `BehaviorSubject`
servisi (umesto Context), scoped CSS (umesto CSS Modules), template-driven forme (`ngModel`),
`loadComponent` lazy rute.

## Inventar Android projekta (`glumacplusandroid/`)

| Sloj | Fajlovi | Status |
|---|---|---|
| Bootstrap | `MainActivity.kt` (setContent + ViewModel-i), `AndroidManifest.xml` | gotovo |
| Build/deps | `app/build.gradle.kts`, `gradle/libs.versions.toml` (Retrofit, coroutines, Navigation, DataStore, ikonice) | gotovo |
| Dizajn (tema) | `ui/theme/{Color,Theme,Type}.kt` (Calm Editorial: Fraunces/Inter/JetBrains Mono, bež paleta) | gotovo |
| Modeli | `data/model/{Korisnik,Proizvod,Porudzbina}.kt` (`@Serializable data class`) | gotovo |
| Mreža | `data/remote/{ApiService,ApiClient}.kt` (Retrofit interfejs + klijent) | gotovo |
| Lokalno | `data/local/TokenStore.kt` (DataStore) | gotovo |
| ViewModel-i (stanje) | `viewmodel/{Auth,Cart,Meni,Istorija,Status,AktivnaPorudzbina}ViewModel.kt` (`StateFlow`) | gotovo |
| Navigacija | `ui/AppNav.kt` (`NavHost` + rute) | gotovo |
| Ekrani | `ui/{auth,meni,korpa,istorija,status}/…Screen.kt` (`@Composable`) | gotovo |

**Arhitektonski potpis Android verzije:** `@Composable` funkcije, `ViewModel` + `StateFlow` (umesto
Context/servisa), Retrofit + Coroutines (`suspend`/`Flow`), Navigation Compose (`NavHost`), DataStore
(umesto localStorage), `data class` modeli, Material 3 tema. Backend host iz emulatora = **`10.0.2.2:8080`**.

---

## Sloj 1: Bootstrap & konfiguracija

### Ulazna tačka
```tsx
// React — main.tsx: globalno = ugnježdene provider komponente
createRoot(document.getElementById('root')!).render(
  <BrowserRouter><AuthProvider><CartProvider><AktivnaPorudzbinaProvider>
    <App />
  </AktivnaPorudzbinaProvider></CartProvider></AuthProvider></BrowserRouter>
);
```
```ts
// Angular — main.ts: korenska komponenta + objekat konfiguracije
bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
```

### Provideri / DI
```ts
// Angular — app.config.ts
providers: [ provideZoneChangeDetection({eventCoalescing:true}), provideRouter(routes), provideHttpClient() ]
```
React nema DI; "globalno" su Context provideri iz `main.tsx`. Angular servisi sa
`@Injectable({providedIn:'root'})` su automatski globalni — zato `app.config.ts` ne pominje
`AuthService`/`CartService`.

| | React | Angular |
|---|---|---|
| Globalna infra | ugnježdene `<Provider>` komponente | lista provider funkcija (`appConfig`) |
| HTTP | `fetch` (ugrađen) | `provideHttpClient()` → `HttpClient` |
| Pristup globalu | `useAuth()` (samo u provideru) | `inject(AuthService)` (bilo gde) |

### Routing
```ts
// Angular — app.routes.ts (rute kao podaci, lazy + guard)
{ path:'', pathMatch:'full', redirectTo:'login' },
{ path:'login', loadComponent: () => import('./pages/login/login.component').then(m=>m.LoginComponent) },
{ path:'istorija', canActivate:[authGuard], loadComponent: ... },   // Faza C
```
React: `<BrowserRouter>` + `<Routes><Route .../></Routes>` u `App.tsx`. Render mesto:
React `<Routes>` ↔ Angular `<router-outlet />`. Lazy: `React.lazy` ↔ `loadComponent`.
Zaštita: `<PrivateRoute>` komponenta ↔ `canActivate:[authGuard]` funkcija.

### Env
React (Vite): `import.meta.env.VITE_API_URL` (ponovljeno u 8 fajlova).
Angular: `environment.ts` (`{apiUrl:'http://localhost:8080'}`) — jedan tipovani objekat,
file-replacement pri buildu.

---

## Sloj 2: Modeli / tipovi

- **React:** tipovi rasuti i duplirani — `interface Proizvod` definisan **5 puta identično**
  (`CartContext`, `MeniPage`, `ProizvodKartica`, `HomePage`, `OmiljenePage`);
  `Korisnik`/`LoyaltyProgram` inline u `AuthContext`. Jedini centralni fajl: `types/porudzbina.ts`.
- **Angular:** sve u `core/models/` (3 fajla), eksportovano, bez duplikata.

| | React | Angular |
|---|---|---|
| Lokacija | inline uz potrošača (co-location) | `core/models/` |
| Duplikacija | `Proizvod` × 5 | 0 |
| `export` | često ne | uvek |
| Promena polja | ručno na N mesta | 1 mesto |

Oba dele konstante uz tip (`TIP_LABELE`). React ima i helper `tipLabela(tip?)` sa fallback-om.

---

## Sloj 3: Deljeno stanje — Context ↔ Service (najvažnije)

| | React Context | Angular Service |
|---|---|---|
| Mehanizam | `createContext`+`<Provider>`+`useXxx()` | `@Injectable({providedIn:'root'})` |
| Stanje | `useState` (re-render) | `BehaviorSubject` (emit) |
| Pristup | `useAuth()` | `inject(AuthService)` |
| Reaktivnost | komponenta se re-renderuje | komponenta se pretplati (`subscribe`/`async`) |

### Ključna projektna razlika — gde se dešava HTTP
```ts
// React: AuthContext.login SAMO upisuje; LoginPage sam radi fetch
const login = (korisnik, token) => { setKorisnik(korisnik); setToken(token); }

// Angular: AuthService.login SAM radi http.post i upisuje rezultat
login(podaci: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, podaci)
    .pipe(tap(res => { localStorage.setItem('token', res.token); this.tokenSubject.next(res.token); ... }));
}
```
➡️ Angular = deblji servis (stanje + mreža), tanja komponenta. React = čist store, fetch u komponenti.

### Izvedeno stanje
- React: `useMemo` sa dependency nizom (`popust`).
- Angular: obični **getter** `get popust()` (računa se pri čitanju, bez keša).

### Korpa — ista logika, drugi "objavi promenu"
- React: `setKorpa(prev => ...)` + `useEffect([korpa])` za sessionStorage persist (auto).
- Angular: `this.azuriraj(korpa)` = `korpaSubject.next()` + `sessionStorage.setItem()` (eksplicitno).

### Čitanje u komponenti
- React: `const {korisnik} = useAuth();`
- Angular: `auth.korisnik` (sync getter) **ili** `auth.korisnik$ | async` (reaktivno).

---

## Sloj 4: Zaštita ruta — `PrivateRoute` ↔ `authGuard`

```tsx
// React: render-time komponenta-omotač
function PrivateRoute({children}) { const {korisnik}=useAuth();
  return korisnik ? <>{children}</> : <Navigate to="/login" replace/>; }
<Route path="/istorija" element={<PrivateRoute><IstorijaPage/></PrivateRoute>} />
```
```ts
// Angular: funkcija na ruti (pre aktivacije)
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService); const router = inject(Router);
  if (auth.jeUlogovan) return true;
  router.navigate(['/login']); return false;
};
{ path:'istorija', canActivate:[authGuard], loadComponent: ... }
```

| | React | Angular |
|---|---|---|
| Oblik | komponenta | funkcija (`CanActivateFn`) |
| Kad | tokom render-a deteta | **pre** aktivacije rute |
| Posledica | dete uđe u render pa ga zameni `<Navigate>` | zaštićena komponenta se i ne instancira (ni lazy chunk ne učita) |
| Primena | obmotati svaki `element` | `canActivate:[...]` na više ruta |

---

## Sloj 5: Komponente

### A) `ProizvodKartica` — prezentaciona
```ts
// React props ↔ Angular @Input
interface Props { proizvod; kolicina; popust; onDodaj; onPovecaj; onSmanji }
// Angular:
@Input({required:true}) proizvod!: Proizvod;
@Output() dodaj = new EventEmitter<Proizvod>();   // (click)="dodaj.emit(proizvod)"
```
| | React | Angular |
|---|---|---|
| Ulaz | props | `@Input()` |
| Izlaz | callback props (`onDodaj`) | `@Output() EventEmitter` (`.emit()`) |
| Obavezno | TS tip | `@Input({required:true})` (runtime upozorenje) |
| Izvedeno | lokalni `const` | getter |
| Uslov render | ternar / `&&` | `*ngIf` + `ng-template #else` |
| Memo | `React.memo` | `ChangeDetectionStrategy.OnPush` (TODO: dodati) |
| Ikone | `<Plus size={13}/>` | `<lucide-icon [img]="Plus" [size]="13"/>` |
| Animacije | `motion`/`AnimatePresence` | izostavljeno (CSS) |

### B) `Navbar` — stanje + životni ciklus
```ts
// Scroll listener: React useEffect + ručni add/removeEventListener
useEffect(()=>{ const f=()=>setScrolled(scrollY>20); addEventListener('scroll',f);
  return ()=>removeEventListener('scroll',f); },[]);
// Angular: deklarativni @HostListener (sam se skida)
@HostListener('window:scroll') onScroll(){ this.scrolled = window.scrollY>20; }
```
- Pretplata na stanje: React Context auto re-render ↔ Angular `ngOnInit` subscribe + `ngOnDestroy` unsubscribe (ili `async` pipe).
- Aktivni link: React `<NavLink className={({isActive})=>...}>` ↔ Angular `routerLinkActive="..."`.
- Logout: React `window.location.href='/'` (hard reload) ↔ Angular `router.navigate(['/'])` (SPA, bez reload-a).
- Izostavljeno iz Angular isečka: klik-van-zatvara (`useRef`+`mousedown`), body scroll lock, logo slike, svetla/tamna varijanta, Loyalty/Panel/Omiljene linkovi.

---

## Sloj 6: Stranice i tok naručivanja (Faza B)

### 6.1 Meni stranica — izvedeno stanje i liste

**React** koristi tri hook-a za isto što Angular radi getterima + jednim `subscribe`:
```tsx
// React (MeniPage)
const [proizvodi, setProizvodi] = useState([]);
useEffect(() => { fetch(`${API}/api/proizvodi`).then(...).then(setProizvodi); }, []);
const kategorije = useMemo(() => ['Sve', ...new Set(proizvodi.map(p=>p.tip))], [proizvodi]);
const filtrirani = useMemo(() => proizvodi.filter(...), [proizvodi, aktivniTab, pretraga]);
```
```ts
// Angular (MeniComponent)
ngOnInit() { this.proizvodService.getSvi().subscribe(d => this.proizvodi = d); }
get kategorije() { return ['Sve', ...new Set(this.proizvodi.map(p=>p.tip))]; }
get filtrirani() { return this.proizvodi.filter(...); }   // bez dependency niza
```

| | React | Angular |
|---|---|---|
| Učitavanje podataka | `useEffect(()=>fetch,[])` | `ngOnInit` + `service.getSvi().subscribe` |
| Izvedeno (kategorije/filter) | `useMemo([deps])` | obični **getter** (računa svaki CD ciklus) |
| Lista | `{stavke.map(p => <Kartica key={p.id}/>)}` | `<app-kartica *ngFor="let p of stavke; trackBy: trackById"/>` |
| Stabilan identitet | `key={p.id}` | `trackBy: trackById` |
| Količina na kartici | iz `korpa.find(...)` (re-render) | `kolicinaZa(id)` (čita lokalno ogledalo korpe iz `korpa$`) |

➡️ React eksplicitno navodi zavisnosti (`useMemo([...])`); Angular getter se preračunava pri svakoj
change-detection proveri — jednostavnije za pisati, treba paziti samo kod skupih izračuna.

### 6.2 Forme — controlled inputs ↔ `[(ngModel)]`

```tsx
// React: "controlled" — value + onChange ručno
<input value={pretraga} onChange={e => setPretraga(e.target.value)} />
```
```html
<!-- Angular: two-way binding jednim atributom -->
<input [(ngModel)]="pretraga" />
```
`[(ngModel)]` je sintaksni šećer za `[ngModel]="x"` + `(ngModelChange)="x=$event"` — tj. isti
"value + onChange" princip kao React, samo spojen. (U Register formi koristimo i odvojeni
`(ngModelChange)` da očistimo grešku polja — ekvivalent React `handlePromena`.)

### 6.3 Korpa drawer — uslovna stanja i animacije

Drawer ima 3 među-stanja (uspešno / prazna korpa / lista stavki) — ista logika, druga sintaksa:
```tsx
// React: ternar lanac u JSX-u
{uspesno ? <Uspeh/> : korpa.length===0 ? <Prazna/> : <Stavke/>}
```
```html
<!-- Angular: zasebni *ngIf blokovi -->
<div *ngIf="uspesno">...</div>
<div *ngIf="!uspesno && korpa.length === 0">...</div>
<div *ngIf="!uspesno && korpa.length > 0">...</div>
```

| | React | Angular |
|---|---|---|
| Otvaranje/zatvaranje | `drawerOtvoren` iz `useCart()` | `cart.drawerOtvoren$` subscribe |
| Animacija ulaza | `motion` `initial/animate/exit` + `AnimatePresence` | CSS `@keyframes drawerIn` (slide) + `overlayFade` |
| Naručivanje | `fetch` u komponenti, pa `otvoriStatus()` | `porudzbina.kreiraj().subscribe()`, pa `aktivna.otvoriStatus()` |
| Posle uspeha | `isprazni()` + `osvezi()` + `setTimeout` | isto, `cart.isprazni()` + `auth.osvezi().subscribe()` + `setTimeout` |

➡️ Jedina prava razlika je **animacija**: React `motion` ima ulaz **i izlaz** (exit) animaciju kroz
`AnimatePresence`; CSS verzija lako radi ulaz, a izlaz bi tražio dodatni state (svesno izostavljeno).

### 6.4 Trigger korpe — `FloatingBubble` (paritet) + cart dugme u navbaru

Angular verzija ima **oba**: portovan `FloatingBubble` (plutajuće dugme) **i** cart dugme u navbaru.
Razlog: React skriva bubble na `/meni` desktopu jer tamo postoji `MiniKorpa`; pošto naš isečak nema
MiniKorpu, navbar dugme preuzima tu ulogu (korpa uvek dostupna na meniju).

`FloatingBubble` ima dvostruku ulogu (verno preslikano):
- **bez aktivne porudžbine:** ikona korpe + badge (`ukupnoStavki`), klik → otvara drawer
- **sa aktivnom porudžbinom:** 👨‍🍳 (ChefHat), klik → otvara Status modal (`otvoriStatus`)

| | React | Angular |
|---|---|---|
| Desktop detekcija | `useIsDesktop` hook (`matchMedia` + `useEffect`) | `matchMedia` + listener u `ngOnInit`/`ngOnDestroy` |
| Trenutna ruta (`/meni`?) | `useLocation().pathname` | `Router.url` + `router.events` (`NavigationEnd`) |
| Uslov prikaza | `(aktivnaId \|\| ukupnoStavki>0) && !sakrij` | isto, kroz getter `prikazan` |
| Ulaz/izlaz animacija | `motion` spring + `AnimatePresence` | CSS `@keyframes bubbleIn` (bez exit-a) |
| Puls (aktivna) | CSS `@keyframes puls` | isti CSS puls |

---

## Sloj 7: Polling i složeno stanje (Faza C)

### 7.1 Status porudžbine — polling (`setInterval` ↔ RxJS `timer`)

Najinteresantnija razlika u celom projektu. Status modal periodično pita backend za status.

```tsx
// React (StatusPorudzbine): setInterval + ručno čišćenje
useEffect(() => {
  const fetchStatus = async () => { const r = await fetch(`/api/porudzbine/${id}`); setStatus(...); };
  fetchStatus();                          // odmah jednom
  if (zavrseno) return;                   // ne pokreći ako je gotovo
  const interval = setInterval(fetchStatus, 8000);
  return () => clearInterval(interval);   // cleanup
}, [porudzbinaId, token, zavrseno]);
```
```ts
// Angular (StatusPorudzbineComponent): RxJS timer + switchMap
this.pollSub = timer(0, 8000).pipe(           // 0 = odmah, pa svakih 8s
  switchMap(() => this.porudzbina.getJedan(id))  // otkazuje stari GET ako stigne novi tik
).subscribe(p => {
  this.status = p.status;
  if (this.zavrseno) this.zaustaviPolling();  // unsubscribe kad je gotovo
});
```

| | React | Angular |
|---|---|---|
| Mehanizam | `setInterval` + `fetch` | `timer(0, 8000)` + `switchMap(getJedan)` |
| Otkazivanje zastarelog zahteva | ručno (ili se ignoriše) | **`switchMap` automatski** otkazuje prethodni GET |
| Čišćenje | `clearInterval` u `useEffect` cleanup | `pollSub.unsubscribe()` |
| Stop kad gotovo | `if (zavrseno) return` (re-run effecta) | `if (zavrseno) zaustaviPolling()` |

➡️ Ovde RxJS zaista blista: `switchMap` rešava "race condition" (spor odgovor stigne posle novog
zahteva) **besplatno** — u React-u bi to tražilo `AbortController` ili ručnu zastavicu.

### 7.2 Status — okidanje preko deljenog servisa

React modal je u `App.tsx` uslovljen contextom (`aktivnaId && statusOtvoren`). Angular modal je u
`app.component` i sam se pretplaćuje na `AktivnaPorudzbinaService.statusOtvoren$` — kad postane `true`,
pokreće polling; kad `false`, zaustavlja. Isti "globalni event", druga mehanika (context ↔ Observable).

### 7.3 Istorija — paginacija i expand stanje

```tsx
// React: Page | List handling + expand kroz useState po kartici
const [razvijeno, setRazvijeno] = useState(false);   // unutar svake kartice-komponente
if (Array.isArray(data)) { setPorudzbine(data); setUkupnoStrana(1); }
else { setPorudzbine(data.content); setUkupnoStrana(data.totalPages); }
```
```ts
// Angular: isti Page|List guard + expand kroz Set<number> na nivou stranice
private razvijeni = new Set<number>();
toggleRazvij(id) { this.razvijeni.has(id) ? this.razvijeni.delete(id) : this.razvijeni.add(id); }
```

| | React | Angular |
|---|---|---|
| Page vs List odgovor | `Array.isArray(data)` grananje | isto (`Array.isArray`) |
| Expand stanje | `useState` u **dečjoj** komponenti (`PorudzbinaKartica`) | `Set<number>` u **roditelju** (jedna komponenta) |
| Otkazivanje | lokalni `setPorudzbine(map)` | lokalni `this.porudzbine = map(...)` |
| Aktivna kartica | `find(U_PRIPREMI/SPREMNA)` + filter iz liste | isto, kroz gettere `aktivna`/`istorija` |
| „Prati uživo" | `otvoriStatus(id)` (context) | `aktivnaService.otvoriStatus(id)` |

**Razlika u dekompoziciji:** React deli Istoriju na pod-komponente (`PorudzbinaKartica`,
`AktivnaKartica`, `OmiljenaModal`) — svaka sa svojim stanjem. Angular isečak drži sve u jednoj
`IstorijaComponent` (expand kroz `Set`), jer je manje pod-stanja (nema omiljena modala).

---

## Android — Kotlin + Jetpack Compose (mapiranje po slojevima)

Native Android, deklarativni UI (Jetpack Compose) — konceptualno najbliži React/Angular-u
(stanje → UI se sam prekucava). Ključna razlika: nije browser (nema DOM/CSS/fetch/CORS),
nego Kotlin + Android SDK.

### A1: Bootstrap & DI — `MainActivity` + `viewModel()`

```kotlin
// MainActivity.kt — ulazna tačka; globalni ViewModel-i se kreiraju na nivou Activity-ja i dele.
class MainActivity : ComponentActivity() {
  override fun onCreate(...) {
    setContent {
      GlumacplusandroidTheme {
        val auth: AuthViewModel = viewModel()      // Activity-scoped → deli se svim ekranima
        val cart: CartViewModel = viewModel()
        val aktivna: AktivnaPorudzbinaViewModel = viewModel()
        AppNav(auth, cart, aktivna)
      }
    }
  }
}
```
- React ugnježdeni `<Provider>` / Angular `providedIn:'root'` ↔ Android **`viewModel()` skopiran na Activity** (deli se) ili na ekran (lokalno stanje).
- HTTP: `fetch`/`HttpClient` ↔ **Retrofit** (`ApiClient`), registruje se ručno u `object`-u (nema DI kontejnera).
- Env: `import.meta.env` / `environment.ts` ↔ `const BASE_URL = "http://10.0.2.2:8080/"` u `ApiClient`.

### A2: Modeli — `data class`

```kotlin
@Serializable
data class Proizvod(val id: Long, val naziv: String, val opis: String? = null,
                    val cena: Double, val tip: String, val alergeniNazivi: List<String>? = null)
```
- TS `interface` ↔ Kotlin **`data class`** (+ `@Serializable` za JSON). Centralizovano u `data/model/` (kao Angular).
- ⚠️ **Zamka (nije u web verzijama):** Kotlin je strogo tipiziran — backend šalje decimalne brojeve
  (`brojBodova: 0.0`, `kolicina: 1.0`), a `Int` puca na `1.0`. TS `number` to nikad ne primeti.
  Rešenje: takva polja su `Double`. **Konkretna prednost dinamičkog tipiziranja u web-u.**

### A3: Deljeno stanje — `ViewModel` + `StateFlow`

```kotlin
class AuthViewModel(app: Application) : AndroidViewModel(app) {
  private val _korisnik = MutableStateFlow<Korisnik?>(null)
  val korisnik: StateFlow<Korisnik?> = _korisnik.asStateFlow()   // javno read-only
  fun login(email, lozinka, onUspeh) = viewModelScope.launch {
    val res = api.login(LoginRequest(email, lozinka))            // suspend poziv (coroutine)
    _korisnik.value = res.korisnik; tokenStore.sacuvaj(...)
  }
}
```
| | React Context | Angular Service | **Android ViewModel** |
|---|---|---|---|
| Stanje | `useState` | `BehaviorSubject` | **`MutableStateFlow`** |
| Javno | vrednost iz hooka | `Observable` (`xxx$`) | **`StateFlow` (`asStateFlow`)** |
| Čitanje u UI | `useAuth()` | `\| async` / subscribe | **`collectAsState()`** |
| Async I/O | `fetch` u komponenti | `HttpClient` u servisu | **`suspend` + `viewModelScope.launch`** |

➡️ `private _xxx MutableStateFlow` + `public xxx StateFlow` je **tačna paralela** Angular
`private Subject` + `public Observable`. HTTP je u ViewModel-u (kao Angular servis), ne u UI-ju.

### A4: Zaštita ruta — `LaunchedEffect` redirect

Nema deklarativnog guard-a; koristi se reakcija na auth stanje u navigaciji:
```kotlin
LaunchedEffect(korisnik) {
  if (korisnik != null && ruta != MENI) nav.navigate(MENI) { popUpTo(LOGIN){inclusive=true} }
  else if (korisnik == null && ...) nav.navigate(LOGIN) { popUpTo(0){inclusive=true} }
}
```
- React `<PrivateRoute>` / Angular `canActivate` ↔ Android **`LaunchedEffect` koji reaguje na `StateFlow`** i preusmerava. Manje deklarativno, ali isti efekat.

### A5: Komponente — `@Composable` (props ↔ parametri, callback ↔ lambda)

```kotlin
@Composable
fun ProizvodKartica(p: Proizvod, kolicina: Int,
                    onDodaj: () -> Unit, onPovecaj: () -> Unit, onSmanji: () -> Unit) {
  Card { Column {
    Text(p.naziv, style = MaterialTheme.typography.titleMedium)
    if (kolicina == 0) Button(onClick = onDodaj) { Text("Dodaj") }
    else Row { IconButton(onSmanji){...}; Text("$kolicina"); IconButton(onPovecaj){...} }
  } }
}
```
| | React | Angular | **Android Compose** |
|---|---|---|---|
| Ulaz | props | `@Input` | **parametri funkcije** |
| Izlaz | callback props | `@Output` | **lambda parametri** (`() -> Unit`) |
| Uslov | `{cond && …}` | `*ngIf` | **`if/when` u Kotlinu** |
| Lista | `.map()` | `*ngFor` | **`LazyColumn { items(...) }`** (lazy = renderuje samo vidljivo) |
| Lokalno stanje | `useState` | polje klase | **`remember { mutableStateOf() }`** |
| Životni ciklus | `useEffect` | `ngOnInit` | **`LaunchedEffect(key)`** |

### A6: Naručivanje + polling (Status)

```kotlin
// StatusViewModel — polling coroutine loop-om (ekvivalent RxJS timer+switchMap+takeWhile)
job = viewModelScope.launch {
  while (isActive) {
    val p = api.porudzbina(bearer, id); _status.value = p.status
    if (p.status == REALIZOVANA || p.status == OTKAZANA) break   // takeWhile
    delay(8000)                                                   // timer(8000)
  }
}
```
- React `setInterval`/Angular `timer(0,8000)+switchMap` ↔ Android **coroutine `while+delay`** (ili `flow{}`). `switchMap` (auto-otkazivanje) ovde nije potreban jer je loop sekvencijalan.

### A7: Navigacija i globalni FloatingBubble

```kotlin
NavHost(nav, startDestination = LOGIN) {
  composable(MENI) { MeniScreen(...) }
  composable("status/{porudzbinaId}",                              // ruta sa argumentom
    arguments = listOf(navArgument("porudzbinaId"){ type = NavType.LongType })
  ) { entry -> StatusScreen(id = entry.arguments!!.getLong("porudzbinaId"), ...) }
}
```
- React `<Routes>` / Angular `Routes`+`<router-outlet>` ↔ Android **`NavHost` + `composable(ruta)`**.
- Lazy: `React.lazy` / `loadComponent` ↔ ekrani su obične funkcije (nema lazy chunk-ova — sve u APK-u).
- `FloatingBubble` (Angular) ↔ Compose **`ExtendedFloatingActionButton`** u `Scaffold`-u, uslovljen `AktivnaPorudzbinaViewModel` stanjem.

### Dizajn — kako je postignut isti „Calm Editorial" izgled

| | React/Angular (web) | **Android (Compose)** |
|---|---|---|
| Boje | CSS varijable (`--paper/--ink/--rust`) | **Material 3 `ColorScheme`** (`lightColorScheme(...)`) |
| Fontovi | Google Fonts `@import` | **spakovani TTF-ovi** (`res/font/`) + `FontFamily` |
| Tipografija | CSS klase | **`Typography` (Fraunces italik naslovi, Inter, JetBrains Mono labele)** |
| Komponente stil | scoped CSS / CSS Modules | **Material 3 komponente** (`Card`, `TopAppBar`, `Button`) + tema |
| Uglovi | oštri (0px, editorial) | zaobljeni (mobilni standard) — svesno odstupanje |

---

## Sažetak razlika (cheat-sheet)

| Koncept | React | Angular | Android (Kotlin + Compose) |
|---|---|---|---|
| UI jedinica | funkcija + JSX | klasa + HTML template | **`@Composable` funkcija** |
| Deljeno stanje | Context + hooks | servis + `BehaviorSubject` | **`ViewModel` + `StateFlow`** |
| Reaktivnost | re-render (`useState`) | emit/subscribe (`Observable`) | **emit/collect (`StateFlow`)** |
| Čitanje stanja u UI | `useXxx()` | `\| async` / subscribe | **`collectAsState()`** |
| Ulaz (props) | props objekat | `@Input` | **parametri funkcije** |
| Događaji ka roditelju | callback props | `@Output() EventEmitter` | **lambda parametri** |
| Uslovni prikaz | `{cond && ...}` / ternar | `*ngIf` / `ng-template` | **`if`/`when` (Kotlin)** |
| Lista | `.map()` | `*ngFor` | **`LazyColumn { items() }`** |
| Lokalno stanje | `useState` | polje klase | **`remember { mutableStateOf() }`** |
| Životni ciklus | `useEffect` | `ngOnInit`/`ngOnDestroy` | **`LaunchedEffect(key)`** |
| Forma | controlled `value`+`onChange` | `[(ngModel)]` two-way | **`value` + `onValueChange`** |
| Rute | `<Route>` JSX | `Routes` niz | **`NavHost { composable() }`** |
| Zaštita rute | `<PrivateRoute>` | `canActivate:[guard]` | **`LaunchedEffect` redirect** |
| DI | nema (props/context) | `inject()` | **`viewModel()` (scope)** |
| HTTP | `fetch` | `HttpClient` (Observable) | **Retrofit (`suspend`)** |
| Async | Promise/async | RxJS Observable | **Coroutines / `Flow`** |
| Polling | `setInterval` | `timer`+`switchMap` | **`while`+`delay` (coroutine)** |
| Lokalno čuvanje | `localStorage` | `localStorage` | **DataStore** |
| Env / base URL | `import.meta.env` | `environment.ts` | **konstanta (`10.0.2.2:8080`)** |
| Modeli | `interface` | `interface` | **`data class` (`@Serializable`)** |
| Stilovi | CSS Modules | scoped CSS | **Material 3 tema + `Modifier`** |
| Ikone | `lucide-react` | `lucide-angular` | **`material-icons-extended`** |
| Animacije | `motion` | CSS | **Compose animacije (izostavljeno)** |

---

## Status

Sve tri implementacije pokrivaju **isti vertikalni isečak** (Register → Login → Meni → Korpa →
Naručivanje → Status → Istorija), gađaju **isti Spring Boot backend**, i imaju isti „Calm Editorial" dizajn.

- **React** (`frontend/`) — ceo app, predat.
- **Angular** (`frontend-angular/`) — vertikalni isečak, gotov i verifikovan.
- **Android** (`glumacplusandroid/`) — Kotlin + Jetpack Compose, vertikalni isečak, gotov i verifikovan
  (uklj. globalni FloatingBubble, praćenje aktivne porudžbine, editorial tema sa Fraunces/Inter/JetBrains Mono).

**Glavna pouka poređenja:** deklarativni UI + reaktivno stanje su isti mentalni model u sva tri
alata (React hooks ↔ Angular RxJS ↔ Compose `StateFlow`); najveće razlike su u **jeziku i platformi**
(TS dinamički tipovi ↔ Kotlin strogi tipovi; browser DOM/CSS/fetch/CORS ↔ native Android SDK/Retrofit/`10.0.2.2`).
