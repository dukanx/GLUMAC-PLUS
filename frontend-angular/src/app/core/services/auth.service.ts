import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Korisnik, LoyaltyProgram, LoginRequest, LoginResponse } from '../models/korisnik.model';

// @Injectable({ providedIn: 'root' }) = singleton dostupan svuda
// Ekvivalent AuthContext.Provider koji obmotava celu aplikaciju
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // BehaviorSubject — "reaktivna promenljiva"
  // Svako ko uradi subscribe() odmah dobija trenutnu vrednost
  private korisnikSubject = new BehaviorSubject<Korisnik | null>(this.ucitajKorisnika());
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  private loyaltyProgramiSubject = new BehaviorSubject<LoyaltyProgram[]>([]);

  // Javni observables — komponente se pretplaćuju na ove
  korisnik$ = this.korisnikSubject.asObservable();
  token$ = this.tokenSubject.asObservable();
  loyaltyProgrami$ = this.loyaltyProgramiSubject.asObservable();

  constructor() {
    this.ucitajLoyaltyPrograme();
  }

  // Brzi getteri (sinhrono čitanje trenutne vrednosti)
  get korisnik(): Korisnik | null { return this.korisnikSubject.value; }
  get token(): string | null { return this.tokenSubject.value; }
  get jeUlogovan(): boolean { return !!this.tokenSubject.value; }

  get popust(): number {
    const k = this.korisnik;
    if (!k?.loyaltyNivo) return 0;
    const prog = this.loyaltyProgramiSubject.value.find(p => p.nivo === k.loyaltyNivo);
    return prog?.popust ?? 0;
  }

  // Registracija — backend vraća kreiranog korisnika (bez tokena);
  // korisnik se posle preusmerava na /login da se prijavi
  register(podaci: { ime: string; email: string; lozinka: string }): Observable<Korisnik> {
    return this.http.post<Korisnik>(`${environment.apiUrl}/api/korisnici`, podaci);
  }

  login(podaci: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, podaci).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('korisnik', JSON.stringify(res.korisnik));
        this.tokenSubject.next(res.token);
        this.korisnikSubject.next(res.korisnik);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
    sessionStorage.removeItem('mojaKorpa');
    this.tokenSubject.next(null);
    this.korisnikSubject.next(null);
  }

  osvezi(): Observable<Korisnik> {
    return this.http.get<Korisnik>(`${environment.apiUrl}/api/korisnici/me`, {
      headers: { Authorization: `Bearer ${this.token}` },
    }).pipe(
      tap(k => {
        localStorage.setItem('korisnik', JSON.stringify(k));
        this.korisnikSubject.next(k);
      })
    );
  }

  private ucitajKorisnika(): Korisnik | null {
    const json = localStorage.getItem('korisnik');
    return json ? JSON.parse(json) : null;
  }

  private ucitajLoyaltyPrograme(): void {
    this.http.get<LoyaltyProgram[]>(`${environment.apiUrl}/api/loyalty_program`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.loyaltyProgramiSubject.next(data));
  }
}
