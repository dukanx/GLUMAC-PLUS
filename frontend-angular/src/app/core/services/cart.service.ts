import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Proizvod, StavkaKorpe } from '../models/proizvod.model';

const STORAGE_KEY = 'mojaKorpa';

@Injectable({ providedIn: 'root' })
export class CartService {
  private korpaSubject = new BehaviorSubject<StavkaKorpe[]>(this.ucitajKorpu());
  private drawerOtvorenSubject = new BehaviorSubject<boolean>(false);

  korpa$ = this.korpaSubject.asObservable();
  drawerOtvoren$ = this.drawerOtvorenSubject.asObservable();

  get korpa(): StavkaKorpe[] { return this.korpaSubject.value; }
  get drawerOtvoren(): boolean { return this.drawerOtvorenSubject.value; }

  get ukupnaCena(): number {
    return Math.round(this.korpa.reduce((sum, i) => sum + i.proizvod.cena * i.kolicina, 0));
  }

  get ukupnoStavki(): number {
    return this.korpa.reduce((sum, i) => sum + i.kolicina, 0);
  }

  dodaj(proizvod: Proizvod): void {
    const korpa = [...this.korpa];
    const idx = korpa.findIndex(i => i.proizvod.id === proizvod.id);
    if (idx >= 0) {
      korpa[idx] = { ...korpa[idx], kolicina: korpa[idx].kolicina + 1 };
    } else {
      korpa.push({ proizvod, kolicina: 1 });
    }
    this.azuriraj(korpa);
  }

  povecaj(id: number): void {
    this.azuriraj(this.korpa.map(i =>
      i.proizvod.id === id ? { ...i, kolicina: i.kolicina + 1 } : i
    ));
  }

  smanji(id: number): void {
    this.azuriraj(
      this.korpa
        .map(i => i.proizvod.id === id ? { ...i, kolicina: i.kolicina - 1 } : i)
        .filter(i => i.kolicina > 0)
    );
  }

  ukloni(id: number): void {
    this.azuriraj(this.korpa.filter(i => i.proizvod.id !== id));
  }

  isprazni(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.korpaSubject.next([]);
  }

  otvoriDrawer(): void { this.drawerOtvorenSubject.next(true); }
  zatvoriDrawer(): void { this.drawerOtvorenSubject.next(false); }

  private azuriraj(korpa: StavkaKorpe[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(korpa)); } catch {}
    this.korpaSubject.next(korpa);
  }

  private ucitajKorpu(): StavkaKorpe[] {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }
}
