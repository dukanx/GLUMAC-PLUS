import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MapPin, Phone, Star, ShoppingBag } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { ProizvodService } from '../../core/services/proizvod.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Proizvod, StavkaKorpe } from '../../core/models/proizvod.model';
import { Korisnik } from '../../core/models/korisnik.model';
import { ProizvodKarticaComponent } from '../../components/proizvod-kartica/proizvod-kartica.component';

// Normalizacija teksta za pretragu — mala slova, bez dijakritike.
// ⚠️ đ se NE razlaže kroz NFD, pa ga ručno mapiramo na "dj" (vidi memoriju o transliteraciji).
function normalizuj(tekst: string): string {
  return tekst
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'dj');
}

const TELEFON = '+381 65 817 8476';
const ADRESA = 'Dositejeva 1a, Dorćol, Beograd';
const MAPS_URL = 'https://www.google.com/maps/place/glumac+plus/data=!4m2!3m1!1s0x475a7bc2e551cbab:0xb7899385a5114972?sa=X&ved=1t:242&ictx=111';

@Component({
  selector: 'app-meni',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ProizvodKarticaComponent],
  templateUrl: './meni.component.html',
  styleUrl: './meni.component.css',
})
export class MeniComponent implements OnInit, OnDestroy {
  private proizvodService = inject(ProizvodService);
  private cart = inject(CartService);
  private auth = inject(AuthService);

  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly Star = Star;
  readonly ShoppingBag = ShoppingBag;

  readonly TELEFON = TELEFON;
  readonly ADRESA = ADRESA;
  readonly MAPS_URL = MAPS_URL;
  readonly telHref = `tel:${TELEFON.replace(/\s/g, '')}`;

  proizvodi: Proizvod[] = [];
  greska = '';
  ucitava = true;
  pretraga = '';
  aktivniTab = 'Sve';
  toastPoruka: string | null = null;

  // Lokalno ogledalo korpe (za prikaz količine na karticama)
  private korpa: StavkaKorpe[] = [];
  korisnik: Korisnik | null = null;
  private subs: Subscription[] = [];
  private toastTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.subs.push(this.cart.korpa$.subscribe(k => (this.korpa = k)));
    this.subs.push(this.auth.korisnik$.subscribe(k => (this.korisnik = k)));

    this.proizvodService.getSvi().subscribe({
      next: (data) => { this.proizvodi = data; this.ucitava = false; },
      error: () => { this.greska = 'Ne mogu da učitam meni.'; this.ucitava = false; },
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  get popust(): number { return this.auth.popust; }

  // Kategorije = "Sve" + jedinstveni tipovi (computed getter, kao React useMemo)
  get kategorije(): string[] {
    const tipovi = [...new Set(this.proizvodi.map(p => p.tip))];
    return ['Sve', ...tipovi];
  }

  get filtrirani(): Proizvod[] {
    const q = normalizuj(this.pretraga);
    return this.proizvodi.filter(p => {
      const okTab = this.aktivniTab === 'Sve' || p.tip === this.aktivniTab;
      const okPretraga = normalizuj(p.naziv).includes(q);
      return okTab && okPretraga;
    });
  }

  // Grupisanje po kategoriji kad je tab "Sve"
  get grupisani(): { tip: string; stavke: Proizvod[] }[] {
    if (this.aktivniTab !== 'Sve') {
      return [{ tip: this.aktivniTab, stavke: this.filtrirani }];
    }
    return this.kategorije
      .filter(k => k !== 'Sve')
      .map(tip => ({ tip, stavke: this.filtrirani.filter(p => p.tip === tip) }))
      .filter(g => g.stavke.length > 0);
  }

  kolicinaZa(id: number): number {
    return this.korpa.find(i => i.proizvod.id === id)?.kolicina ?? 0;
  }

  handleDodaj(p: Proizvod): void {
    this.cart.dodaj(p);
    this.toastPoruka = `${p.naziv} dodata u korpu`;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toastPoruka = null), 2500);
  }

  handlePovecaj(id: number): void { this.cart.povecaj(id); }
  handleSmanji(id: number): void { this.cart.smanji(id); }

  obrisiPretragu(): void { this.pretraga = ''; }

  // trackBy — Angular ekvivalent React-ovog key={...} (stabilan identitet u *ngFor)
  trackByTip(_: number, g: { tip: string }): string { return g.tip; }
  trackById(_: number, p: Proizvod): number { return p.id; }
}
