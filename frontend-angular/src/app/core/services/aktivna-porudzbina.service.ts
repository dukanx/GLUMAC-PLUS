import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Angular ekvivalent React-ovog AktivnaPorudzbinaContext.
// Prati ID poslednje aktivne porudžbine (u localStorage) i da li je Status modal otvoren.
// Drawer poziva otvoriStatus() posle naručivanja; Status modal i Istorija ga konzumiraju.
const LS_KLJUC = 'aktivna_porudzbina_id';

@Injectable({ providedIn: 'root' })
export class AktivnaPorudzbinaService {
  private aktivnaIdSubject = new BehaviorSubject<number | null>(this.ucitaj());
  private statusOtvorenSubject = new BehaviorSubject<boolean>(false);

  aktivnaId$ = this.aktivnaIdSubject.asObservable();
  statusOtvoren$ = this.statusOtvorenSubject.asObservable();

  get aktivnaId(): number | null { return this.aktivnaIdSubject.value; }
  get statusOtvoren(): boolean { return this.statusOtvorenSubject.value; }

  otvoriStatus(id: number): void {
    localStorage.setItem(LS_KLJUC, String(id));
    this.aktivnaIdSubject.next(id);
    this.statusOtvorenSubject.next(true);
  }

  zatvoriStatus(): void {
    this.statusOtvorenSubject.next(false);
  }

  resetuj(): void {
    localStorage.removeItem(LS_KLJUC);
    this.aktivnaIdSubject.next(null);
  }

  private ucitaj(): number | null {
    const stored = localStorage.getItem(LS_KLJUC);
    const n = stored ? Number(stored) : NaN;
    return Number.isInteger(n) ? n : null;
  }
}
