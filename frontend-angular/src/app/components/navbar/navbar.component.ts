import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, UtensilsCrossed, ClipboardList, LogIn, LogOut, ShoppingBag } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { Korisnik } from '../../core/models/korisnik.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private router = inject(Router);

  // Ikone za LucideAngularModule
  readonly UtensilsCrossed = UtensilsCrossed;
  readonly ClipboardList = ClipboardList;
  readonly LogIn = LogIn;
  readonly LogOut = LogOut;
  readonly ShoppingBag = ShoppingBag;

  korisnik: Korisnik | null = null;
  brojStavki = 0;
  scrolled = false;
  menuOtvoren = false;
  private subs: Subscription[] = [];

  // @HostListener — Angular ekvivalent addEventListener
  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 20;
  }

  ngOnInit(): void {
    this.subs.push(this.auth.korisnik$.subscribe(k => { this.korisnik = k; }));
    this.subs.push(this.cart.korpa$.subscribe(() => { this.brojStavki = this.cart.ukupnoStavki; }));
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  otvoriKorpu(): void { this.cart.otvoriDrawer(); }

  handleLogout(): void {
    this.auth.logout();
    this.menuOtvoren = false;
    this.router.navigate(['/']);
  }

  zatvori(): void { this.menuOtvoren = false; }
}
