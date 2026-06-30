import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  // imports — šta koristimo u template-u:
  // CommonModule → *ngIf, *ngFor
  // FormsModule  → [(ngModel)] two-way binding
  // RouterLink   → routerLink direktiva
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  lozinka = '';
  greska = '';
  ucitava = false;
  justRegistered = this.route.snapshot.queryParamMap.get('registered') === 'true';

  async handleSubmit(): Promise<void> {
    this.greska = '';
    this.ucitava = true;

    this.auth.login({ email: this.email, lozinka: this.lozinka }).subscribe({
      next: () => this.router.navigate(['/meni']),
      error: (err) => {
        this.greska = err.error?.message ?? 'Pogrešan email ili lozinka.';
        this.ucitava = false;
      },
      complete: () => { this.ucitava = false; },
    });
  }
}
