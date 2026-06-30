import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { LucideAngularModule, ShoppingBag, ChefHat } from 'lucide-angular';
import { Subscription, filter } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { AktivnaPorudzbinaService } from '../../core/services/aktivna-porudzbina.service';

@Component({
  selector: 'app-floating-bubble',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './floating-bubble.component.html',
  styleUrl: './floating-bubble.component.css',
})
export class FloatingBubbleComponent implements OnInit, OnDestroy {
  private cart = inject(CartService);
  private aktivna = inject(AktivnaPorudzbinaService);
  private router = inject(Router);

  readonly ShoppingBag = ShoppingBag;
  readonly ChefHat = ChefHat;

  ukupnoStavki = 0;
  aktivnaId: number | null = null;
  naMeni = false;
  isDesktop = false;

  private subs: Subscription[] = [];
  private mq?: MediaQueryList;
  private mqHandler = (e: MediaQueryListEvent) => { this.isDesktop = e.matches; };

  ngOnInit(): void {
    this.subs.push(this.cart.korpa$.subscribe(() => { this.ukupnoStavki = this.cart.ukupnoStavki; }));
    this.subs.push(this.aktivna.aktivnaId$.subscribe(id => { this.aktivnaId = id; }));

    // Prati trenutnu rutu da znamo da li smo na /meni (gde bubble skrivamo na desktopu)
    this.naMeni = this.router.url.startsWith('/meni');
    this.subs.push(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(e => { this.naMeni = (e as NavigationEnd).urlAfterRedirects.startsWith('/meni'); })
    );

    // Desktop detekcija (>=1000px) — ekvivalent React useIsDesktop hook-a
    this.mq = window.matchMedia('(min-width: 1000px)');
    this.isDesktop = this.mq.matches;
    this.mq.addEventListener('change', this.mqHandler);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.mq?.removeEventListener('change', this.mqHandler);
  }

  // Na /meni desktopu skrivamo bubble (osim ako postoji aktivna porudžbina)
  get sakrij(): boolean {
    return this.naMeni && this.isDesktop && this.aktivnaId === null;
  }

  get prikazan(): boolean {
    return (this.aktivnaId !== null || this.ukupnoStavki > 0) && !this.sakrij;
  }

  get jeAktivan(): boolean { return this.aktivnaId !== null; }

  handleClick(): void {
    if (this.aktivnaId !== null) this.aktivna.otvoriStatus(this.aktivnaId);
    else this.cart.otvoriDrawer();
  }
}
