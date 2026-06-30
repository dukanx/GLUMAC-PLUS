import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, X, Plus, Minus, Trash2, ShoppingCart, CheckCircle2 } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { PorudzbinaService } from '../../core/services/porudzbina.service';
import { AktivnaPorudzbinaService } from '../../core/services/aktivna-porudzbina.service';
import { StavkaKorpe } from '../../core/models/proizvod.model';
import { TIP_LABELE, TipPorudzbine } from '../../core/models/porudzbina.model';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.css',
})
export class CartDrawerComponent implements OnInit, OnDestroy {
  private cart = inject(CartService);
  private auth = inject(AuthService);
  private porudzbina = inject(PorudzbinaService);
  private aktivna = inject(AktivnaPorudzbinaService);
  private router = inject(Router);

  readonly X = X;
  readonly Plus = Plus;
  readonly Minus = Minus;
  readonly Trash2 = Trash2;
  readonly ShoppingCart = ShoppingCart;
  readonly CheckCircle2 = CheckCircle2;

  readonly TIP_LABELE = TIP_LABELE;
  readonly tipovi = Object.keys(TIP_LABELE) as TipPorudzbine[];

  korpa: StavkaKorpe[] = [];
  drawerOtvoren = false;

  tipPorudzbine: TipPorudzbine = 'U_LOKALU';
  napomena = '';
  porucivanjeUToku = false;
  uspesno = false;
  greska = '';

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.subs.push(this.cart.korpa$.subscribe(k => (this.korpa = k)));
    this.subs.push(this.cart.drawerOtvoren$.subscribe(o => (this.drawerOtvoren = o)));
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  get ukupnaCena(): number { return this.cart.ukupnaCena; }
  get ukupnoStavki(): number { return this.cart.ukupnoStavki; }
  get popust(): number { return this.auth.popust; }

  // Zaokruživanje finalne cene — isto pravilo kao backend i meni (round(ukupno * (1 - popust/100)))
  get zaPlacanje(): number {
    return this.popust > 0 ? Math.round(this.ukupnaCena * (1 - this.popust / 100)) : this.ukupnaCena;
  }
  get popustIznos(): number { return this.ukupnaCena - this.zaPlacanje; }

  povecaj(id: number): void { this.cart.povecaj(id); }
  smanji(id: number): void { this.cart.smanji(id); }
  ukloni(id: number): void { this.cart.ukloni(id); }
  isprazni(): void { this.cart.isprazni(); }
  zatvoriDrawer(): void { this.cart.zatvoriDrawer(); }

  idiNaMeni(): void {
    this.cart.zatvoriDrawer();
    this.router.navigate(['/meni']);
  }

  redniIznos(stavka: StavkaKorpe): number {
    return Math.round(stavka.proizvod.cena * stavka.kolicina);
  }

  handleNaruci(): void {
    if (!this.auth.korisnik || !this.auth.token) {
      this.zatvoriDrawer();
      this.router.navigate(['/login']);
      return;
    }

    this.greska = '';
    this.porucivanjeUToku = true;

    this.porudzbina.kreiraj({
      tipPorudzbine: this.tipPorudzbine,
      napomena: this.napomena.trim() || null,
      stavke: this.korpa.map(i => ({ proizvodId: i.proizvod.id, kolicina: i.kolicina })),
    }).subscribe({
      next: (res) => {
        const novaId = res?.porudzbinaId ?? null;
        this.cart.isprazni();
        this.napomena = '';
        this.uspesno = true;
        this.porucivanjeUToku = false;
        // Osveži korisnika (loyalty bodovi) — tihi fail nije bitan ovde
        this.auth.osvezi().subscribe({ error: () => {} });
        setTimeout(() => {
          this.uspesno = false;
          this.cart.zatvoriDrawer();
          if (novaId) this.aktivna.otvoriStatus(novaId);
        }, 2000);
      },
      error: (err) => {
        this.greska = err.error?.message ?? 'Greška prilikom naručivanja.';
        this.porucivanjeUToku = false;
      },
    });
  }

  trackById(_: number, i: StavkaKorpe): number { return i.proizvod.id; }
}
