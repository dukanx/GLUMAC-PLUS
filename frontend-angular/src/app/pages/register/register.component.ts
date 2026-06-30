import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

// Greške po polju — ekvivalent React `FieldErrors` interfejsa
interface GreskePolja {
  ime?: string;
  email?: string;
  lozinka?: string;
  potvrda?: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Polja forme — u Reactu su bila u jednom `forma` state objektu;
  // ovde su prosta svojstva vezana preko [(ngModel)]
  ime = '';
  email = '';
  lozinka = '';
  potvrda = '';

  greske: GreskePolja = {};
  serverGreska = '';
  ucitava = false;

  // Briše grešku za jedno polje čim korisnik krene da kuca (kao React handlePromena)
  ocistiGresku(polje: keyof GreskePolja): void {
    if (this.greske[polje]) {
      this.greske = { ...this.greske, [polje]: undefined };
    }
  }

  private validiraj(): boolean {
    const nove: GreskePolja = {};

    if (!this.ime.trim()) {
      nove.ime = 'Ime je obavezno';
    }
    if (!this.email.trim()) {
      nove.email = 'Email je obavezan';
    } else if (!/\S+@\S+\.\S+/.test(this.email)) {
      nove.email = 'Email nije ispravan';
    }
    if (!this.lozinka) {
      nove.lozinka = 'Lozinka je obavezna';
    } else if (this.lozinka.length < 8) {
      nove.lozinka = 'Minimum 8 karaktera';
    }
    if (!this.potvrda) {
      nove.potvrda = 'Potvrdite lozinku';
    } else if (this.lozinka !== this.potvrda) {
      nove.potvrda = 'Lozinke se ne poklapaju';
    }

    this.greske = nove;
    return Object.keys(nove).length === 0;
  }

  handleSubmit(): void {
    if (!this.validiraj()) return;

    this.ucitava = true;
    this.serverGreska = '';

    this.auth.register({ ime: this.ime, email: this.email, lozinka: this.lozinka }).subscribe({
      next: () => {
        // Uspeh → na login sa porukom (login komponenta čita ?registered=true)
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (err) => {
        const data = err.error;
        if (data?.errors) {
          // Backend validacione greške po polju
          this.greske = data.errors;
        } else {
          this.serverGreska = data?.message ?? 'Došlo je do greške. Pokušajte ponovo.';
        }
        this.ucitava = false;
      },
    });
  }
}
